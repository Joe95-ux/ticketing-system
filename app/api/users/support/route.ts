import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch users with SUPPORT role
    const supportUsers = await db.user.findMany({
      where: {
        role: "SUPPORT",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(supportUsers);
  } catch (error) {
    console.error("Failed to fetch support users:", error);
    return NextResponse.json(
      { error: "Failed to fetch support users" },
      { status: 500 }
    );
  }
} 