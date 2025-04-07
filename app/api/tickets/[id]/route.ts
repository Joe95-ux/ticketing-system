import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import * as z from "zod";
import { requireAuth } from "@/lib/auth-helpers";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { sendTicketEmail } from "@/lib/email";
import { logActivity } from "@/lib/activity-logger";

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.enum(["GENERAL", "TECHNICAL", "BILLING", "FEATURE_REQUEST", "BUG"]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  assignedToId: z.string().optional(),
  txHash: z.string().optional(),
});

type paramsType = Promise<{ id: string }>;

const handleError = (error: unknown, context: string) => {
  console.error(`[TICKET_${context}]`, error);
  
  if (error instanceof z.ZodError) {
    return new NextResponse(JSON.stringify(error.issues), { status: 422 });
  }
  
  return new NextResponse("Internal Server Error", { status: 500 });
};

export async function DELETE(
  request: Request,
  { params }: { params: paramsType }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        assignedTo: true,
        createdBy: true
      },
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    // Check if user has permission to delete the ticket
    const canDelete =
      session.user.role === "ADMIN" ||
      ticket.createdBy.id === session.user.id ||
      ticket.assignedTo?.id === session.user.id;

    if (!canDelete) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await db.ticket.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleError(error, "DELETE");
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { status, priority, assignedToId: assignedId } = updateSchema.parse(body);

    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    // Update the ticket
    const updatedTicket = await db.ticket.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(assignedId !== undefined && { assignedId }),
      },
      include: {
        assignedTo: true,
      },
    });

    // Log status change
    if (status && status !== ticket.status) {
      await logActivity({
        action: status === "RESOLVED" ? "resolved_ticket" :
               status === "CLOSED" ? "closed_ticket" :
               status === "OPEN" && ticket.status !== "OPEN" ? "reopened_ticket" :
               "changed_status",
        userId: session.user.id,
        ticketId: params.id,
        details: {
          previousStatus: ticket.status,
          newStatus: status,
        },
      });
    }

    // Log priority change
    if (priority && priority !== ticket.priority) {
      await logActivity({
        action: "changed_priority",
        userId: session.user.id,
        ticketId: params.id,
        details: {
          previousPriority: ticket.priority,
          newPriority: priority,
        },
      });
    }

    // Log assignment change
    if (assignedId !== undefined && assignedId !== ticket.assignedId) {
      await logActivity({
        action: "assigned_ticket",
        userId: session.user.id,
        ticketId: params.id,
        details: {
          previousAssignee: ticket.assignedTo?.name || ticket.assignedTo?.email || "Unassigned",
          assignedTo: updatedTicket.assignedTo?.name || updatedTicket.assignedTo?.email || "Unassigned",
        },
      });
    }

    // Send real-time updates
    if (status) {
      await pusherServer.trigger(`ticket-${params.id}`, "ticket:update", {
        ticketId: params.id,
        updatedBy: session.user.name || session.user.email,
        timestamp: new Date().toISOString(),
        status,
      });
    }

    if (priority) {
      await pusherServer.trigger(`ticket-${params.id}`, "ticket:update", {
        ticketId: params.id,
        updatedBy: session.user.name || session.user.email,
        timestamp: new Date().toISOString(),
        priority,
      });
    }

    if (assignedId !== undefined) {
      await pusherServer.trigger(`ticket-${params.id}`, "ticket:update", {
        ticketId: params.id,
        updatedBy: session.user.name || session.user.email,
        timestamp: new Date().toISOString(),
        assignedTo: updatedTicket.assignedTo?.name || updatedTicket.assignedTo?.email || "Unassigned",
      });
    }

    // Send email notifications
    const notifyUser = ticket.createdBy.id !== session.user.id ? ticket.createdBy :
                      updatedTicket.assignedTo && updatedTicket.assignedTo.id !== session.user.id ? updatedTicket.assignedTo :
                      null;

    if (notifyUser) {
      await sendTicketEmail("ticket-updated", {
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        recipientEmail: notifyUser.email!,
        recipientName: notifyUser.name,
        updaterName: session.user.name || session.user.email || "Unknown User",
        status: status || undefined,
        priority: priority || undefined,
        assignedTo: updatedTicket.assignedTo?.name || undefined,
      });
    }

    return NextResponse.json(updatedTicket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[TICKET_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  context: { params: paramsType }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await context.params;
    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedTo: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!ticket) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error(error);
    return handleError(error, "GET");
  }
} 