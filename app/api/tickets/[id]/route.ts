import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import * as z from "zod";
import { requireAuth } from "@/lib/auth-helpers";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { sendTicketEmail } from "@/lib/email";

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
    console.error("[TICKET_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
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

    const values = await req.json();
    const { status, assignedToId, priority } = updateSchema.parse(values);

    const ticket = await db.ticket.update({
      where: {
        id: params.id,
      },
      data: {
        ...(status && { status }),
        ...(assignedToId && { assignedToId }),
        ...(priority && { priority }),
      },
      include: {
        assignedTo: true,
        createdBy: true,
      },
    });

    // Send email notification for status changes
    if (status && ticket.createdBy.email) {
      await sendTicketEmail("ticket-updated", {
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        recipientEmail: ticket.createdBy.email,
        recipientName: ticket.createdBy.name,
        updaterName: session.user.name,
      });
    }

    // Send real-time updates for each change
    const updaterName = session.user.name || session.user.email || "Support Team";

    if (status) {
      await pusherServer.trigger(`ticket-${ticket.id}`, "ticket:update", {
        ticketId: ticket.id,
        status: ticket.status,
        updatedBy: updaterName,
        timestamp: new Date().toISOString(),
        type: "status",
      });
    }

    if (priority) {
      await pusherServer.trigger(`ticket-${ticket.id}`, "ticket:update", {
        ticketId: ticket.id,
        priority: ticket.priority,
        updatedBy: updaterName,
        timestamp: new Date().toISOString(),
        type: "priority",
      });
    }

    if (assignedToId) {
      await pusherServer.trigger(`ticket-${ticket.id}`, "ticket:update", {
        ticketId: ticket.id,
        assignedTo: ticket.assignedTo ? {
          name: ticket.assignedTo.name,
          email: ticket.assignedTo.email,
        } : null,
        updatedBy: updaterName,
        timestamp: new Date().toISOString(),
        type: "assignment",
      });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 