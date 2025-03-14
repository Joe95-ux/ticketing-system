import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only allow admins to fetch support users for assignment
    if (session.user.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch active support users
    const supportUsers = await db.user.findMany({
      where: {
        role: "SUPPORT",
        email: {
          not: "",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: [
        { name: "asc" },
        { email: "asc" }, // Secondary sort by email if name is null
      ],
    });

    if (!supportUsers.length) {
      return NextResponse.json([]);
    }

    return NextResponse.json(supportUsers);
  } catch (error) {
    console.error("Failed to fetch support users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 