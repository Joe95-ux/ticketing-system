import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as z from "zod";
import { requireAuth, canManageTicket } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.enum(["GENERAL", "TECHNICAL", "BILLING", "FEATURE_REQUEST", "BUG"]).optional(),
  txHash: z.string().optional(),
});

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    let body;
    try {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      return new NextResponse("Invalid JSON", { status: 400 });
    }

    if (!Object.keys(body).length) {
      return new NextResponse("At least one field must be provided", { status: 400 });
    }

    const parsed = updateSchema.parse(body);
    const { id } = context.params;

    // Fetch the current ticket to check permissions
    const ticket = await db.ticket.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    // Check if user has permission to update
    if (!canManageTicket(session, ticket)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update the ticket in the database
    const updatedTicket = await db.ticket.update({
      where: { id },
      data: {
        ...(parsed.status && { status: parsed.status }),
        ...(parsed.txHash && { txHash: parsed.txHash }),
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    // Revalidate the ticket page
    revalidatePath(`/tickets/${id}`);

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("[TICKET_UPDATE]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    if (session instanceof NextResponse) return session;

    const { id } = await Promise.resolve(context.params);
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 