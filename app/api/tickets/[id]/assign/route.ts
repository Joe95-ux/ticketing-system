import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTicketEmail } from "@/lib/email";
import * as z from "zod";

const assignSchema = z.object({
  assignedId: z.string(),
});

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only admins can assign tickets
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const json = await req.json();
    const body = assignSchema.parse(json);

    // Get the ticket and verify it exists
    const ticket = await db.ticket.findUnique({
      where: { id: context.params.id },
      include: {
        createdBy: true,
      },
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    // Get the assignee
    const assignee = await db.user.findUnique({
      where: { id: body.assignedId },
    });

    if (!assignee) {
      return new NextResponse("Assignee not found", { status: 404 });
    }

    // Update the ticket
    const updatedTicket = await db.ticket.update({
      where: { id: context.params.id },
      data: {
        assignedId: body.assignedId || null,
        status: "IN_PROGRESS",
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    // Send email to assignee
    await sendTicketEmail("ticket-assigned", {
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      recipientEmail: assignee.email!,
      recipientName: assignee.name,
    });

    // Notify ticket creator
    await sendTicketEmail("ticket-updated", {
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      recipientEmail: ticket.createdBy.email!,
      recipientName: ticket.createdBy.name,
      assigneeName: assignee.name,
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error assigning ticket:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 