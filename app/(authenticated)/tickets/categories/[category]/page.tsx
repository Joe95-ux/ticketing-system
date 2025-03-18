import { Metadata } from "next";
import { db } from "@/lib/db";
import { TicketList } from "@/components/tickets/ticket-list";
import { notFound } from "next/navigation";
import { Ticket } from "@/types";

export const metadata: Metadata = {
  title: "Category Tickets | Ticketing System",
  description: "View tickets by category",
};

const categories = {
  GENERAL: "General",
  TECHNICAL: "Technical",
  BILLING: "Billing",
  FEATURE_REQUEST: "Feature Request",
  BUG: "Bug Report",
} as const;

async function getTicketsByCategory(category: string): Promise<Ticket[]> {
  const tickets = await db.ticket.findMany({
    where: {
      category: category as keyof typeof categories,
    },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: true,
      assignedTo: true,
    },
  });

  return tickets as unknown as Ticket[];
}

type paramsType = Promise<{ category: string }>;

export default async function CategoryPage(props: { params: paramsType }) {
  
  let {category} = await props.params;
  category = category.toUpperCase();
  
  if (!Object.keys(categories).includes(category)) {
    notFound();
  }

  const tickets = await getTicketsByCategory(category);
  const categoryLabel = categories[category as keyof typeof categories];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{categoryLabel} Tickets</h1>
      </div>
      <TicketList 
        tickets={tickets} 
        emptyMessage={`No tickets found in the ${categoryLabel.toLowerCase()} category`}
      />
    </div>
  );
} 