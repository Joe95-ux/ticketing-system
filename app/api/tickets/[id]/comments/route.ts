import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import * as z from "zod";

const commentSchema = z.object({
  content: z.string().min(1),
});

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
    const body = commentSchema.parse(json);
    const id = await Promise.resolve(context.params.id);

    const ticket = await db.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 });
    }

    const comment = await db.comment.create({
      data: {
        content: body.content,
        userId: session.user.id,
        ticketId: id,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json(comment);
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

    const id = await Promise.resolve(context.params.id);

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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 