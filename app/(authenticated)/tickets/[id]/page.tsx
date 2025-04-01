import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ErrorFallback } from "@/components/error-fallback";
import { TicketDetails } from "@/components/tickets/ticket-details";
import { useRealtimeTicket } from "@/hooks/use-realtime-ticket";
import { Suspense } from "react";
import type { Ticket, User, Comment } from "@prisma/client";

interface TicketPageProps {
  params: {
    id: string;
  };
}

interface TicketWithRelations extends Ticket {
  createdBy: User;
  assignedTo: User | null;
  comments: (Comment & { user: User })[];
}

export async function generateMetadata({ params }: TicketPageProps): Promise<Metadata> {
  try {
    const ticket = await db.ticket.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });

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
  } catch {
    return {
      title: "Error Loading Ticket",
      description: "An error occurred while loading the ticket."
    };
  }
}

function TicketContent({ ticket }: { ticket: TicketWithRelations }) {
  useRealtimeTicket(ticket.id);
  return <TicketDetails ticket={ticket} />;
}

export default async function TicketPage({ params }: TicketPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const ticket = await db.ticket.findUnique({
    where: { id: params.id },
    include: {
      createdBy: true,
      assignedTo: true,
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!ticket) {
    return <ErrorFallback message="Ticket not found" />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TicketContent ticket={ticket} />
    </Suspense>
  );
}