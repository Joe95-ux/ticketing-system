import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import * as z from "zod";

const ticketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
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
    const body = ticketSchema.parse(json);

    const ticket = await db.ticket.create({
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority,
        category: body.category,
        status: "OPEN",
        userId: session.user.id,
      },
      include: {
        createdBy: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(ticket);
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