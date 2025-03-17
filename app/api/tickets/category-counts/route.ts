import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categoryConfig } from "@/components/tickets/category-badge";

export async function GET() {
  try {
    // Get counts for each category using separate count queries
    const counts = await Promise.all(
      Object.keys(categoryConfig).map(async (category) => {
        const count = await db.ticket.count({
          where: {
            category: category as keyof typeof categoryConfig,
          },
        });
        return [category, count];
      })
    );

    // Convert array of [category, count] pairs to an object
    const categoryCounts = Object.fromEntries(counts);

    return NextResponse.json(categoryCounts, {
      headers: {
        'Cache-Control': 'max-age=300', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Failed to fetch category counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch category counts" },
      { status: 500 }
    );
  }
} 