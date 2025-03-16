import { Metadata } from "next";
import { db } from "@/lib/db";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketList } from "@/components/tickets/ticket-list";
import Link from "next/link";
import { Ticket } from "@/types";

export const metadata: Metadata = {
  title: "Tickets | Ticketing System",
  description: "Manage your support tickets",
};

async function getTickets(): Promise<Ticket[]> {
  const tickets = await db.ticket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: true,
      assignedTo: true,
    },
  });

  return tickets as unknown as Ticket[];
}

export default async function TicketsPage() {
  const tickets = await getTickets();

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
      <TicketList tickets={tickets} />
    </div>
  );
} 