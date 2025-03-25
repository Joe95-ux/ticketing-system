import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatePassword } from "@/lib/utils";
import { sendTicketEmail } from "@/lib/email";

const createUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "SUPPORT", "USER"]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const json = await req.json();
    const body = createUserSchema.parse(json);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    // Generate a random password
    const password = generatePassword();
    const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await db.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        role: body.role,
      },
    });

    // Send welcome email with credentials
    await sendTicketEmail('welcome-user', {
      email: body.email,
      password: password,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return new NextResponse(
      error instanceof z.ZodError
        ? "Invalid request data"
        : "Internal server error",
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
} 