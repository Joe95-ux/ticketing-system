import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return Response.json([]);
    }

    const users = await db.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
        NOT: {
          id: session.user.id, // Exclude current user
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 5, // Limit results
    });

    return Response.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
} 