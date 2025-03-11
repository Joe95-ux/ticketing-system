import { Metadata } from "next";
import db from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  Clock,
  MessageSquare,
  TicketCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Ticket } from "@/types";

export const metadata: Metadata = {
  title: "Dashboard | Ticketing System",
  description: "View your ticket statistics and recent activity",
};

async function getTicketStats() {
  const [total, open, inProgress, resolved] = await Promise.all([
    db.ticket.count(),
    db.ticket.count({ where: { status: "OPEN" } }),
    db.ticket.count({ where: { status: "IN_PROGRESS" } }),
    db.ticket.count({ where: { status: "RESOLVED" } }),
  ]);

  return { total, open, inProgress, resolved };
}

async function getRecentTickets() {
  return db.ticket.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: true,
      assignedTo: true,
    },
  });
}

export default async function DashboardPage() {
  const stats = await getTicketStats();
  const recentTickets = await getRecentTickets();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <TicketCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTickets.map((ticket: Ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <p className="font-medium">{ticket.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Created by {ticket.createdBy.name} •{" "}
                    {ticket.assignedTo
                      ? `Assigned to ${ticket.assignedTo.name}`
                      : "Unassigned"}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-semibold",
                    {
                      "bg-yellow-100 text-yellow-800": ticket.status === "OPEN",
                      "bg-blue-100 text-blue-800":
                        ticket.status === "IN_PROGRESS",
                      "bg-green-100 text-green-800":
                        ticket.status === "RESOLVED",
                      "bg-gray-100 text-gray-800": ticket.status === "CLOSED",
                    }
                  )}
                >
                  {ticket.status}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 