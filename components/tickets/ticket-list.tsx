"use client";

import { Ticket } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { CategoryBadge } from "./category-badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TicketListProps {
  tickets: Ticket[];
  emptyMessage?: string;
  isLoading?: boolean;
}

const statusVariants = {
  OPEN: "warning",
  IN_PROGRESS: "default",
  RESOLVED: "success",
  CLOSED: "secondary",
} as const;

const priorityVariants = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "destructive",
} as const;

function TicketTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
              <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border p-8 text-center">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center gap-4">
        <div className="text-muted-foreground">{message}</div>
        <Link href="/tickets/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Ticket
          </Button>
        </Link>
      </div>
    </div>
  );
}

function TicketTable({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>
                <Link
                  href={`/tickets/${ticket.id}`}
                  className="font-medium hover:underline"
                >
                  {ticket.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[ticket.status]}>
                  {ticket.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={priorityVariants[ticket.priority]}>
                  {ticket.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <CategoryBadge category={ticket.category} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(ticket.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell>{ticket.createdBy.name}</TableCell>
              <TableCell>
                {ticket.assignedTo ? ticket.assignedTo.name : "Unassigned"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function TicketList({ tickets, emptyMessage = "No tickets found", isLoading = false }: TicketListProps) {
  if (isLoading) {
    return <TicketTableSkeleton />;
  }

  if (!tickets.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return <TicketTable tickets={tickets} />;
} 