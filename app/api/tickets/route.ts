import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as z from "zod";
import { sendTicketEmail } from "@/lib/email";

const createTicketSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required.",
  }),
  description: z.string().min(1, {
    message: "Description is required.",
  }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  category: z.enum(["GENERAL", "TECHNICAL", "BILLING", "FEATURE_REQUEST", "BUG"]),
});

type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type Category = "GENERAL" | "TECHNICAL" | "BILLING" | "FEATURE_REQUEST" | "BUG";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = createTicketSchema.parse(json);

    // Find similar tickets (case insensitive partial match)
    const similarTickets = await db.ticket.findMany({
      where: {
        title: {
          contains: body.title,
          mode: 'insensitive',
        },
      },
      take: 5, // Limit to 5 similar tickets
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    // Create the new ticket
    const ticket = await db.ticket.create({
      data: {
        ...body,
        status: "OPEN",
        userId: session.user.id,
      },
      include: {
        createdBy: true,
      },
    });

    // Send email to admins
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
    });

    // Send notification to each admin
    await Promise.all(
      admins.map((admin) =>
        sendTicketEmail("ticket-created", {
          ticketId: ticket.id,
          ticketTitle: ticket.title,
          recipientEmail: admin.email!,
          recipientName: admin.name,
        })
      )
    );

    // Send confirmation to ticket creator
    await sendTicketEmail("ticket-created", {
      ticketId: ticket.id,
      ticketTitle: ticket.title,
      recipientEmail: session.user.email!,
      recipientName: session.user.name,
    });

    // Return both the created ticket and similar tickets
    return NextResponse.json({
      ticket,
      similarTickets: similarTickets.length > 0 ? similarTickets : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating ticket:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as Status | null;
    const priority = searchParams.get("priority") as Priority | null;
    const category = searchParams.get("category") as Category | null;

    const tickets = await db.ticket.findMany({
      where: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(category && { category }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 