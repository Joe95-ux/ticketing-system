import { Metadata } from "next";
import { notFound } from "next/navigation";
import { findTicket } from "@/lib/db-utils";
import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorFallback } from "@/components/error-fallback";
import { TicketDetails } from "@/components/tickets/ticket-details";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const id = await Promise.resolve(params.id);
  try {
    const ticket = await findTicket(id);
    if (!ticket) {
      return {
        title: "Ticket Not Found",
        description: "The requested ticket could not be found."
      };
    }
    return {
      title: `Ticket #${ticket.id} - ${ticket.title}`,
      description: ticket.description || "No description provided"
    };
  } catch (error) {
    return {
      title: "Error Loading Ticket",
      description: "An error occurred while loading the ticket."
    };
  }
}

export default async function TicketPage({ params }: { params: { id: string } }) {
  const ticket = await findTicket(params.id);
  
  if (!ticket) {
    notFound();
  }

  return (
    <ErrorBoundary
      fallback={
        <ErrorFallback
          message="Error loading ticket details"
          backPath="/tickets"
        />
      }
    >
      <TicketDetails ticket={ticket} />
    </ErrorBoundary>
  );
}