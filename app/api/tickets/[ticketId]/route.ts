import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

type paramsType = Promise<{ ticketId: string }>;

export async function DELETE(
  request: Request,
  { params }: { params: paramsType }
) {
  const { ticketId } = await params;
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ticket = await db.ticket.findUnique({
      where: { id: ticketId },
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
      where: { id: ticketId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TICKET_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { ticketId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const ticket = await db.ticket.findUnique({
      where: { id: params.ticketId },
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
      where: { id: params.ticketId },
      data: {
        title: json.title,
        description: json.description,
        priority: json.priority,
        status: json.status,
        category: json.category,
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("[TICKET_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 