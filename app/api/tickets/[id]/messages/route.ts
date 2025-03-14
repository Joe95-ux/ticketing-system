import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTicketEmail } from "@/lib/email";
import * as z from "zod";

const messageSchema = z.object({
  content: z.string().min(1),
  recipientId: z.string(),
});

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ticket = await db.ticket.findUnique({
      where: { id: context.params.id },
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    // Check if user can access this ticket's messages
    const canAccess =
      session.user.id === ticket.userId ||
      session.user.id === ticket.assignedId ||
      session.user.role === "ADMIN";

    if (!canAccess) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const messages = await db.message.findMany({
      where: {
        ticketId: context.params.id,
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = messageSchema.parse(json);

    // Get the ticket and verify it exists
    const ticket = await db.ticket.findUnique({
      where: { id: context.params.id },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    // Verify that the user can send messages in this ticket
    const canSendMessage =
      session.user.id === ticket.userId ||
      session.user.id === ticket.assignedId ||
      session.user.role === "ADMIN";

    if (!canSendMessage) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Create the message
    const message = await db.message.create({
      data: {
        content: body.content,
        ticketId: context.params.id,
        senderId: session.user.id,
        recipientId: body.recipientId,
      },
      include: {
        sender: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Send email notification
    const recipient = await db.user.findUnique({
      where: { id: body.recipientId },
    });

    if (recipient && recipient.id !== session.user.id) {
      await sendTicketEmail("ticket-updated", {
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        recipientEmail: recipient.email!,
        recipientName: recipient.name,
        updaterName: session.user.name,
        comment: body.content,
      });
    }

    return NextResponse.json(message);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating message:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 