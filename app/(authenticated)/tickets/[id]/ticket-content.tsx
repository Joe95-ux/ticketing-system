"use client";

import { useRealtimeTicket } from "@/hooks/use-realtime-ticket";
import { TicketDetails } from "@/components/tickets/ticket-details";
import type { Ticket, User, Comment, ActivityLog } from "@prisma/client";

interface TicketWithRelations extends Ticket {
  createdBy: User;
  assignedTo: User | null;
  comments: (Comment & { user: User })[];
  activityLogs: (ActivityLog & {
    user: Pick<User, "name" | "email">;
  })[];
}

export function TicketContent({ ticket }: { ticket: TicketWithRelations }) {
  useRealtimeTicket(ticket.id, ticket); // real-time hook with pusher + sounds
  return <TicketDetails ticket={ticket} />;
}
