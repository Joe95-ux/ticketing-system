import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

export async function generateMetadata({
  params,
}: TicketPageProps): Promise<Metadata> {
  // Await the params resolution
  const resolvedParams = await Promise.resolve(params);
  const ticket = await db.ticket.findUnique({
    where: { id: resolvedParams.id },
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

export default async function TicketPage({ params }: TicketPageProps) {
  // Await the params resolution
  const resolvedParams = await Promise.resolve(params);
  const ticket = await getTicket(resolvedParams.id);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{ticket.title}</h1>
        <TicketActions ticket={ticket} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="text-sm font-medium">Details</CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={statusVariants[ticket.status as Status]}>
                {ticket.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Priority</span>
              <Badge variant={priorityVariants[ticket.priority as Priority]}>
                {ticket.priority}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Category</span>
              <Badge variant="outline">{ticket.category}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">
                {formatDistanceToNow(new Date(ticket.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created By</span>
              <span className="text-sm">{ticket.createdBy.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Assigned To</span>
              <span className="text-sm">
                {ticket.assignedTo?.name || "Unassigned"}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm font-medium">Description</CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {ticket.description}
            </p>
          </CardContent>
        </Card>
      </div>
      <TicketBlockchainHistory ticketId={ticket.id} />
      <TicketComments ticketId={ticket.id} initialComments={ticket.comments} />
    </div>
  );
} 