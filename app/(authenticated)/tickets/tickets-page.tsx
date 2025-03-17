"use client";

import { db } from "@/lib/db";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketList } from "@/components/tickets/ticket-list";
import { CategoryFilter } from "@/components/tickets/category-filter";
import Link from "next/link";
import { Ticket } from "@/types";
import { useState, useEffect } from "react";
import { categoryConfig } from "@/components/tickets/category-badge";

async function getTickets(category: string | null = null): Promise<Ticket[]> {
  const tickets = await db.ticket.findMany({
    where: category ? {
      category: category as keyof typeof categoryConfig,
    } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: true,
      assignedTo: true,
    },
  });

  return tickets as unknown as Ticket[];
}

export function TicketsPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Fetch tickets when category changes
  useEffect(() => {
    const fetchTickets = async () => {
      const newTickets = await getTickets(selectedCategory);
      setTickets(newTickets);
    };
    fetchTickets();
  }, [selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Button asChild>
          <Link href="/tickets/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Ticket
          </Link>
        </Button>
      </div>
      
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <TicketList tickets={tickets} />
    </div>
  );
} 