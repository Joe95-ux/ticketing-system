"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  User2,
} from "lucide-react";
import type { ActivityLog, User } from "@prisma/client";

interface ActivityFeedProps {
  activities: (ActivityLog & {
    user: Pick<User, "name" | "email">;
  })[];
}

function getActivityIcon(action: string) {
  switch (action) {
    case "added_comment":
      return <MessageSquare className="h-4 w-4" />;
    case "changed_status":
      return <RefreshCw className="h-4 w-4" />;
    case "changed_priority":
      return <AlertCircle className="h-4 w-4" />;
    case "assigned_ticket":
      return <User2 className="h-4 w-4" />;
    case "resolved_ticket":
    case "closed_ticket":
      return <CheckCircle2 className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getActivityMessage(activity: ActivityLog & { user: Pick<User, "name" | "email"> }) {
  const userName = activity.user.name || activity.user.email;
  const details = activity.details as Record<string, any>;

  switch (activity.action) {
    case "added_comment":
      return `${userName} commented: "${details.content}"`;
    case "changed_status":
      return `${userName} changed status to ${details.newStatus}`;
    case "changed_priority":
      return `${userName} changed priority to ${details.newPriority}`;
    case "assigned_ticket":
      return `${userName} assigned ticket to ${details.assignedTo}`;
    case "resolved_ticket":
      return `${userName} marked ticket as resolved`;
    case "closed_ticket":
      return `${userName} closed the ticket`;
    case "reopened_ticket":
      return `${userName} reopened the ticket`;
    default:
      return `${userName} updated the ticket`;
  }
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities.length) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-x-3 text-sm text-muted-foreground"
        >
          <div className="mt-0.5">
            {getActivityIcon(activity.action)}
          </div>
          <div className="flex-1">
            <p className="text-foreground">
              {getActivityMessage(activity)}
            </p>
            <p className="text-xs">
              {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
} 