import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { TicketActions } from "@/components/tickets/ticket-actions";
import { TicketComments } from "@/components/tickets/ticket-comments";
import { TicketBlockchainHistory } from "@/components/tickets/ticket-blockchain-history";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type BadgeVariant = "warning" | "default" | "success" | "secondary" | "destructive" | "outline";

const statusVariants: Record<Status, BadgeVariant> = {
  OPEN: "warning",
  IN_PROGRESS: "default",
  RESOLVED: "success",
  CLOSED: "secondary",
};

const priorityVariants: Record<Priority, BadgeVariant> = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
};

interface TicketPageProps {
  params: {
    id: string;
  };
}

async function getTicket(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  const ticket = await db.ticket.findUnique({
    where: { id },
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

  return ticket;
}

export async function generateMetadata(props: TicketPageProps): Promise<Metadata> {
  const id = props.params.id;
  
  const ticket = await db.ticket.findUnique({
    where: { id },
  });

  if (!ticket) {
    return {
      title: "Ticket Not Found",
    };
  }

  return {
    title: `Ticket - ${ticket.title}`,
    description: ticket.description,
  };
}

export default async function TicketPage(props: TicketPageProps) {
  const id = props.params.id;
  const ticket = await getTicket(id);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              {ticket.title}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Created by {ticket.createdBy.name || ticket.createdBy.email}
              </span>
              <span>•</span>
              <span>{formatDistanceToNow(ticket.createdAt)} ago</span>
            </div>
          </div>
          <TicketActions ticket={ticket} />
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant={statusVariants[ticket.status as Status]}>{ticket.status}</Badge>
            <Badge variant={priorityVariants[ticket.priority as Priority]}>{ticket.priority}</Badge>
            <Badge variant="secondary">{ticket.category}</Badge>
          </div>
          <div className="text-sm">{ticket.description}</div>
          {ticket.assignedTo && (
            <div className="text-sm text-muted-foreground">
              Assigned to: {ticket.assignedTo.name || ticket.assignedTo.email}
            </div>
          )}
        </CardContent>
      </Card>

      <TicketComments 
        ticketId={ticket.id} 
        initialComments={ticket.comments} 
        status={ticket.status}
      />

      <TicketBlockchainHistory ticketId={ticket.id} />
    </div>
  );
}