import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTicketEmail } from "@/lib/email";
import * as z from "zod";
import { pusherServer } from "@/lib/pusher";
import { logActivity } from "@/lib/activity-logger";

const commentSchema = z.object({
  content: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content } = commentSchema.parse(body);

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

    const comment = await db.comment.create({
      data: {
        content,
        ticketId: params.id,
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    });

    // Log the activity
    await logActivity({
      action: "added_comment",
      userId: session.user.id,
      ticketId: params.id,
      details: {
        commentId: comment.id,
        content: content.substring(0, 100) + (content.length > 100 ? "..." : ""), // Truncate long comments in logs
        userRole: session.user.role,
      },
    });

    // Send real-time update
    await pusherServer.trigger(`ticket-${params.id}`, "ticket:comment", {
      ticketId: params.id,
      updatedBy: session.user.name || session.user.email,
      timestamp: new Date().toISOString(),
      comment: content,
    });

    // Send email notifications
    if (ticket.createdBy.id !== session.user.id) {
      await sendTicketEmail("ticket-updated", {
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        recipientEmail: ticket.createdBy.email!,
        recipientName: ticket.createdBy.name,
        updaterName: session.user.name || session.user.email,
        comment: content,
      });
    }

    if (ticket.assignedTo && ticket.assignedTo.id !== session.user.id) {
      await sendTicketEmail("ticket-updated", {
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        recipientEmail: ticket.assignedTo.email!,
        recipientName: ticket.assignedTo.name,
        updaterName: session.user.name || session.user.email,
        comment: content,
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("[COMMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const comments = await db.comment.findMany({
      where: { ticketId: params.id },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("[COMMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}