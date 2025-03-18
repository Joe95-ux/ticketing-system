import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as z from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["USER", "SUPPORT", "ADMIN"]),
});
type paramsType = Promise<{ id: string }>;
export async function PATCH(
  req: Request,
  context: { params: paramsType }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await context.params;
    const json = await req.json();
    const body = updateRoleSchema.parse(json);

    // Prevent changing own role
    if (session.user.id === id) {
      return new NextResponse(
        "Cannot change your own role",
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data: { role: body.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
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