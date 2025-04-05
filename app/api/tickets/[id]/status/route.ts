import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendTicketEmail } from "@/lib/email";
import * as z from "zod";

const statusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

type paramsType = Promise<{ id: string }>;

export async function POST(
  req: Request,
  context: { params: paramsType }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only allow admins and support staff to change status
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const json = await req.json();
    const body = statusSchema.parse(json);
    const {id} = await context.params;

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

    // Update the ticket status
    const updatedTicket = await db.ticket.update({
      where: { id },
      data: {
        status: body.status,
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    // Send notifications based on the new status
    if (body.status === "RESOLVED" || body.status === "CLOSED") {
      try {
        // Notify the ticket creator
        await sendTicketEmail("ticket-resolved", {
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          recipientEmail: ticket.createdBy.email!,
          recipientName: ticket.createdBy.name,
        });

        // Notify admins
        const admins = await db.user.findMany({
          where: { role: "ADMIN" },
        });

        await Promise.all(
          admins.map((admin) =>
            sendTicketEmail("ticket-resolved", {
              ticketId: ticket.id,
              ticketTitle: ticket.title,
              recipientEmail: admin.email!,
              recipientName: admin.name,
            })
          )
        );
      } catch (emailError) {
        console.error("Failed to send notification emails:", emailError);
        // Continue with the response but log the error
      }
    } else {
      // For other status changes, notify relevant parties
      const notifyUsers = new Set<{ email: string; name: string | null }>();

      // Notify ticket creator
      if (ticket.createdBy.id !== session.user.id) {
        notifyUsers.add({
          email: ticket.createdBy.email!,
          name: ticket.createdBy.name,
        });
      }

      // Notify assigned support staff
      if (ticket.assignedTo && ticket.assignedTo.id !== session.user.id) {
        notifyUsers.add({
          email: ticket.assignedTo.email!,
          name: ticket.assignedTo.name,
        });
      }

      try {
        await Promise.all(
          Array.from(notifyUsers).map((user) =>
            sendTicketEmail("ticket-updated", {
              ticketId: ticket.id,
              ticketTitle: ticket.title,
              recipientEmail: user.email,
              recipientName: user.name,
              updaterName: session.user.name,
            })
          )
        );
      } catch (emailError) {
        console.error("Failed to send notification emails:", emailError);
        // Continue with the response but log the error
      }
    }

    return NextResponse.json(updatedTicket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating ticket status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 