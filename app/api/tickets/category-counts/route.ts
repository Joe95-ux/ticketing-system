import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categoryConfig } from "@/components/tickets/category-badge";

export async function GET() {
  try {
    const categories = Object.keys(categoryConfig);
    const counts = await Promise.all(
      categories.map(async (category) => {
        const count = await db.ticket.count({
          where: { category: category as keyof typeof categoryConfig },
        });
        return [category, count];
      })
    );

    const result = Object.fromEntries(counts);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching category counts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 