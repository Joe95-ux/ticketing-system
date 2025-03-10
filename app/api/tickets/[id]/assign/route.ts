import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import * as z from "zod";

const assignSchema = z.object({
  userId: z.string(),
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

    // Only allow admins and support staff to assign tickets
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const json = await req.json();
    const body = assignSchema.parse(json);

    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Verify that the assigned user exists and is support staff
    const assignedUser = await db.user.findFirst({
      where: {
        id: body.userId,
        role: {
          in: ["ADMIN", "SUPPORT"],
        },
      },
    });

    if (!assignedUser) {
      return new NextResponse("Invalid user assignment", { status: 400 });
    }

    const updatedTicket = await db.ticket.update({
      where: { id: params.id },
      data: {
        assignedId: body.userId,
        status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
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