import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as z from "zod";
import { sendTicketEmail } from "@/lib/email";
import { categoryConfig } from "@/components/tickets/category-badge";

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
      event: 'ticket-created'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error creating ticket:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  try {
    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where: category ? {
          category: category.toUpperCase() as keyof typeof categoryConfig,
        } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: true,
          assignedTo: true,
        },
        skip,
        take: limit,
      }),
      db.ticket.count({
        where: category ? {
          category: category.toUpperCase() as keyof typeof categoryConfig,
        } : undefined,
      }),
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Failed to fetch tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
} 