import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session data:", {
      user: session?.user,
      role: session?.user?.role,
    });

    if (!session?.user) {
      console.log("No session or user found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Allow both admins and support staff to fetch support users
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT") {
      console.log("User role not authorized:", session.user.role);
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch active support users
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
      orderBy: [
        { name: "asc" },
        { email: "asc" },
      ],
    });

    console.log("Found support users:", supportUsers.length);

    return NextResponse.json(supportUsers);
  } catch (error) {
    console.error("Failed to fetch support users. Full error:", error);
    return new NextResponse(
      `Internal Server Error: ${error instanceof Error ? error.message : "Unknown error"}`, 
      { status: 500 }
    );
  }
} 