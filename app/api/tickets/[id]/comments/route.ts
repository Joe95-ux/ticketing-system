import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTicketEmail } from "@/lib/email";
import * as z from "zod";
import { pusherServer } from "@/lib/pusher";

const commentSchema = z.object({
  content: z.string().min(1),
});

type paramsType = Promise<{ id: string }>;

export async function POST(req: Request, context: { params: paramsType }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = commentSchema.parse(json);

    // Await the params resolution
    const { id } = await context.params;

    // Get the ticket and verify it exists
    const ticket = await db.ticket.findUnique({
      where: { id },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    // Check if ticket is resolved or closed
    if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
      return new NextResponse(
        "Cannot add comments to resolved or closed tickets",
        { status: 403 }
      );
    }

    // Check if user can comment on this ticket
    const canComment =
      session.user.id === ticket.createdBy.id || // Ticket creator
      (ticket.assignedTo && session.user.id === ticket.assignedTo.id) || // Assigned staff
      session.user.role === "ADMIN" || // Admin
      session.user.role === "SUPPORT"; // Other support staff

    if (!canComment) {
      return new NextResponse(
        "Only ticket creator, support staff, and admins can comment",
        { status: 403 }
      );
    }

    // Create the comment
    const comment = await db.comment.create({
      data: {
        content: body.content,
        ticketId: id,
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    });

    // Send real-time update
    await pusherServer.trigger(`ticket-${id}`, "ticket:comment", {
      ticketId: id,
      commentId: comment.id,
      content: comment.content,
      createdBy: comment.user.name || comment.user.email || "Unknown User",
      timestamp: comment.createdAt.toISOString(),
    });

    // Determine who needs to be notified
    const notifyUsers = new Map<
      string,
      { email: string; name: string | null }
    >();

    const addUserToNotify = (user: { email: string; name: string | null }) => {
      if (user.email) notifyUsers.set(user.email, user);
    };

    // Always notify the ticket creator if they're not the commenter
    if (ticket.createdBy.id !== session.user.id) {
      addUserToNotify({
        email: ticket.createdBy.email!,
        name: ticket.createdBy.name,
      });
    }

    // Notify assigned support staff if they're not the commenter
    if (ticket.assignedTo && ticket.assignedTo.id !== session.user.id) {
      addUserToNotify({
        email: ticket.assignedTo.email!,
        name: ticket.assignedTo.name,
      });
    }

    // If comment is from support staff or admin, notify the ticket creator
    if (
      (session.user.role === "SUPPORT" || session.user.role === "ADMIN") &&
      ticket.createdBy.id !== session.user.id
    ) {
      addUserToNotify({
        email: ticket.createdBy.email!,
        name: ticket.createdBy.name,
      });
    }

    // Send notifications
    await Promise.all(
      Array.from(notifyUsers.values()).map((user) =>
        sendTicketEmail("ticket-updated", {
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          recipientEmail: user.email,
          recipientName: user.name,
          updaterName: session.user.name,
          comment: body.content,
        })
      )
    );

    return NextResponse.json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating comment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request, context: { params: paramsType }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Await the params resolution
    const { id } = await context.params;

    const ticket = await db.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    // Check if user can view this ticket's comments
    const canViewComments =
      session.user.id === ticket.userId || // Ticket creator
      session.user.id === ticket.assignedId || // Assigned support staff
      session.user.role === "ADMIN" || // Admin
      session.user.role === "SUPPORT"; // Other support staff

    if (!canViewComments) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const comments = await db.comment.findMany({
      where: { ticketId: id },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}