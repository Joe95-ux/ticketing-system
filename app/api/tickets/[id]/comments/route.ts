import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTicketEmail } from "@/lib/email";
import * as z from "zod";
import { pusherServer } from "@/lib/pusher";
import { logActivity } from "@/lib/activity-logger";

// Zod validation schema
const commentSchema = z.object({
  content: z.string().min(1),
});

// --- POST /api/tickets/[id]/comments ---
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
    const { id } = params;

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

    if (["RESOLVED", "CLOSED"].includes(ticket.status)) {
      return new NextResponse(
        "Cannot add comments to resolved or closed tickets",
        { status: 403 }
      );
    }

    const isAuthorized =
      session.user.id === ticket.createdBy.id ||
      (ticket.assignedTo && session.user.id === ticket.assignedTo.id) ||
      ["ADMIN", "SUPPORT"].includes(session.user.role);

    if (!isAuthorized) {
      return new NextResponse(
        "Only ticket creator, support staff, and admins can comment",
        { status: 403 }
      );
    }

    const comment = await db.comment.create({
      data: {
        content,
        ticketId: id,
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    });

    // Log activity
    await logActivity({
      action: "added_comment",
      userId: session.user.id,
      ticketId: id,
      details: {
        commentId: comment.id,
        content: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
        userRole: session.user.role,
      },
    });

    // Real-time update
    await pusherServer.trigger(`ticket-${id}`, "ticket:comment", {
      ticketId: id,
      updatedBy: session.user.name || session.user.email,
      timestamp: new Date().toISOString(),
      comment: content,
    });

    // Email notifications
    const sendTo = [ticket.createdBy, ticket.assignedTo].filter(
      (user) => user && user.id !== session.user.id
    );

    for (const user of sendTo) {
      await sendTicketEmail("ticket-updated", {
        ticketId: ticket.id,
        ticketTitle: ticket.title,
        recipientEmail: user!.email!,
        recipientName: user!.name,
        updaterName: session.user.name || session.user.email!,
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

// --- GET /api/tickets/[id]/comments ---
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

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
    console.error("[COMMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
