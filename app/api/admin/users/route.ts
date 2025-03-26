import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generatePassword } from "@/lib/utils";
import { sendTicketEmail } from "@/lib/email";

const createUserSchema = z.object({
  name: z.string().min(3, "Name must be atleast 3 characters long"),
  email: z.string().email(),
  role: z.enum(["ADMIN", "SUPPORT", "USER"]),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized: Only admins can create new users", { status: 403 });
    }

    const json = await req.json();
    const body = createUserSchema.parse(json);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return new NextResponse("A user with this email already exists", { status: 400 });
    }

    // Generate a random password
    const password = generatePassword();
    const hashedPassword = await hash(password, 10);

    // Create the user
    const user = await db.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role,
      },
    });

    // Send welcome email with credentials
    await sendTicketEmail('welcome-user', {
      name: body.name,
      email: body.email,
      password: password,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path}: ${err.message}`).join(", ");
      return new NextResponse(`Invalid data: ${errors}`, { status: 400 });
    }
    return new NextResponse(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
} 