"use client";

import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TicketActions } from "@/components/tickets/ticket-actions";
import { TicketComments } from "@/components/tickets/ticket-comments";
import { TicketBlockchainHistory } from "@/components/tickets/ticket-blockchain-history";
import type { Ticket } from "@/types";

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

interface TicketDetailsProps {
  ticket: Ticket;
}

export function TicketDetails({ ticket }: TicketDetailsProps) {
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
            <Badge variant={statusVariants[ticket.status]}>{ticket.status}</Badge>
            <Badge variant={priorityVariants[ticket.priority]}>{ticket.priority}</Badge>
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
        initialComments={[]} 
        status={ticket.status}
      />

      <TicketBlockchainHistory ticketId={ticket.id} />
    </div>
  );
} 