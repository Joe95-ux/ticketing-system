import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import * as z from "zod";
import { requireAuth } from "@/lib/auth-helpers";
import { authOptions } from "@/lib/auth";

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.enum(["GENERAL", "TECHNICAL", "BILLING", "FEATURE_REQUEST", "BUG"]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  txHash: z.string().optional(),
});

type paramsType = Promise<{ id: string }>;

export async function DELETE(
  request: Request,
  { params }: { params:paramsType }
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
      where: { id},
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TICKET_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: paramsType}
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    
    // Validate request data against schema
    const validationResult = updateSchema.safeParse(json);
    if (!validationResult.success) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid request data", details: validationResult.error }),
        { status: 400 }
      );
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

    // Check if user has permission to edit the ticket
    const canEdit = 
      session.user.role === "ADMIN" || 
      ticket.createdBy.id === session.user.id ||
      ticket.assignedTo?.id === session.user.id;

    if (!canEdit) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedTicket = await db.ticket.update({
      where: { id },
      data: validationResult.data,
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("[TICKET_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
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