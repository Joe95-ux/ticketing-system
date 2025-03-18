import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma, Category, Status } from "@prisma/client";

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get search parameters from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    // Build where clause conditions
    const conditions: Prisma.TicketWhereInput[] = [];

    // Add search conditions if query exists
    if (query) {
      conditions.push({
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    // Add category filter if specified
    if (category) {
      conditions.push({ category: category as Category });
    }

    // Add status filter if specified
    if (status) {
      conditions.push({ status: status as Status });
    }

    // Create where clause
    const whereClause: Prisma.TicketWhereInput = conditions.length > 0 
      ? { AND: conditions }
      : {};

    // Search tickets with filters
    const tickets = await db.ticket.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        category: true,
        createdAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // Show open tickets first
        { createdAt: 'desc' },
      ],
      take: 15, // Increased limit slightly
    });

    // Get category counts for active search
    const categoryCounts = await db.ticket.groupBy({
      by: ['category'],
      where: whereClause,
      _count: true,
    });

    return NextResponse.json({
      tickets,
      categoryCounts: categoryCounts.reduce((acc: Record<string, number>, curr: { category: string; _count: number }) => {
        acc[curr.category] = curr._count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error("[TICKET_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 