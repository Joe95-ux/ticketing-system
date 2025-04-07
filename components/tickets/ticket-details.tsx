"use client";

import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TicketActions } from "@/components/tickets/ticket-actions";
import { TicketComments } from "@/components/tickets/ticket-comments";
import { TicketBlockchainHistory } from "@/components/tickets/ticket-blockchain-history";
import { ContentRenderer } from "@/components/content-renderer";
import type { ActivityLog, User } from "@prisma/client";
import { useState } from "react";
import { EditTicketForm } from "./edit-ticket-form";
import { useSession } from "next-auth/react";
import { ActivityFeed } from "./activity-feed";

type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
type BadgeVariant = "warning" | "default" | "success" | "secondary" | "destructive" | "outline";
type Category = "GENERAL" | "TECHNICAL" | "BILLING" | "FEATURE_REQUEST" | "BUG";

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

type BaseTicket = {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  category: Category;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  assignedId: string | null;
  txHash: string | null;
};

export type TicketWithRelations = BaseTicket & {
  createdBy: Pick<User, "id" | "name" | "email">;
  assignedTo: Pick<User, "name" | "email"> | null;
  activityLogs: (ActivityLog & {
    user: Pick<User, "name" | "email">;
  })[];
};

interface TicketDetailsProps {
  ticket: TicketWithRelations;
}

export function TicketDetails({ ticket }: TicketDetailsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { data: session } = useSession();

  const isCreator = session?.user?.id === ticket.createdBy.id;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <div className="space-y-6 md:col-span-3">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight break-words">
                {ticket.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Created by {ticket.createdBy.name || ticket.createdBy.email}
                </span>
                <span>•</span>
                <span>{formatDistanceToNow(ticket.createdAt)} ago</span>
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <TicketActions 
                ticket={ticket} 
                canEdit={isCreator}
                canDelete={isCreator}
                onEdit={() => setIsEditModalOpen(true)}
              />
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusVariants[ticket.status]}>{ticket.status}</Badge>
              <Badge variant={priorityVariants[ticket.priority]}>{ticket.priority}</Badge>
              <Badge variant="secondary">{ticket.category}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <ContentRenderer content={ticket.description} />
            </div>
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

        <div className="rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-medium">Activity</h2>
          <ActivityFeed activities={ticket.activityLogs} />
        </div>
      </div>
      <EditTicketForm
        ticket={ticket}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
} 