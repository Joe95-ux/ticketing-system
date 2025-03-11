import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import * as z from "zod";

const updateSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.enum(["GENERAL", "TECHNICAL", "BILLING", "FEATURE_REQUEST", "BUG"]).optional(),
});

export async function PATCH(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await Promise.resolve(context.params);
    const json = await req.json();
    const body = updateSchema.parse(json);

    const ticket = await db.ticket.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!ticket) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Only allow admins, support staff, or ticket creator to update
    const canUpdate =
      session.user.role === "ADMIN" ||
      session.user.role === "SUPPORT" ||
      session.user.id === ticket.userId;

    if (!canUpdate) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedTicket = await db.ticket.update({
      where: { id },
      data: {
        ...body,
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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