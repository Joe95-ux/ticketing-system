import { db } from "@/lib/db";
import type { ActivityLog, User, Ticket } from "@prisma/client";

export interface ActivityWithRelations extends ActivityLog {
  user: Pick<User, "id" | "name" | "email">;
  ticket: Pick<Ticket, "id" | "title"> | null;
  metadata?: {
    newStatus?: string;
    newPriority?: string;
    assigneeName?: string;
  };
}

export async function getActivities() {
  const activities = await db.activityLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      ticket: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return activities.map((activity) => ({
    id: activity.id,
    createdAt: activity.createdAt,
    action: activity.action,
    userId: activity.userId,
    userName: activity.user.name || activity.user.email,
    details: formatActivityDetails(activity as ActivityWithRelations),
  }));
}

function formatActivityDetails(activity: ActivityWithRelations) {
  const ticketInfo = activity.ticket ? `ticket "${activity.ticket.title}"` : "a ticket";
  
  switch (activity.action) {
    case "created_ticket":
      return `Created ${ticketInfo}`;
    case "updated_ticket":
      return `Updated ${ticketInfo}`;
    case "added_comment":
      return `Commented on ${ticketInfo}`;
    case "changed_status":
      return `Changed status of ${ticketInfo} to ${activity.metadata?.newStatus || "unknown"}`;
    case "changed_priority":
      return `Changed priority of ${ticketInfo} to ${activity.metadata?.newPriority || "unknown"}`;
    case "assigned_ticket":
      return `Assigned ${ticketInfo} to ${activity.metadata?.assigneeName || "someone"}`;
    default:
      return `Performed action on ${ticketInfo}`;
  }
} 