"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  User2,
  Filter,
} from "lucide-react";
import type { ActivityLog, User } from "@prisma/client";
import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActivityFeedProps {
  activities: (ActivityLog & {
    user: Pick<User, "name" | "email">;
  })[];
}

const activityTypes = {
  added_comment: "Comments",
  changed_status: "Status Changes",
  changed_priority: "Priority Changes",
  assigned_ticket: "Assignments",
  resolved_ticket: "Resolutions",
  closed_ticket: "Closures",
  reopened_ticket: "Reopens",
} as const;

type ActivityDetails = {
  content?: string;
  newStatus?: string;
  newPriority?: string;
  assignedTo?: string;
};

function toPlainText(html: string) {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
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
  const details = activity.details as ActivityDetails;

  switch (activity.action) {
    case "added_comment":
      return `${userName} commented: "${toPlainText(details.content || "")}"`;
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
  const [selectedTypes, setSelectedTypes] = useState<string[]>(Object.keys(activityTypes));

  const filteredActivities = activities.filter(activity => 
    selectedTypes.includes(activity.action)
  );

  if (!activities.length) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {Object.entries(activityTypes).map(([key, label]) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={selectedTypes.includes(key)}
                onCheckedChange={(checked) => {
                  setSelectedTypes(prev =>
                    checked
                      ? [...prev, key]
                      : prev.filter(type => type !== key)
                  );
                }}
              >
                {label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground">
          No activities match the selected filters
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActivities.map((activity) => (
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
      )}
    </div>
  );
} 