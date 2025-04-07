"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityLogProps {
  activities: {
    id: string;
    createdAt: Date;
    action: string;
    userId: string;
    userName: string;
    details: string;
  }[];
}

export function ActivityLog({ activities }: ActivityLogProps) {
  const [date, setDate] = useState<Date>();
  const [actionFilter, setActionFilter] = useState<string>("all");

  const filteredActivities = activities.filter((activity) => {
    const dateMatches = !date || format(new Date(activity.createdAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
    const actionMatches = actionFilter === "all" || activity.action === actionFilter;
    return dateMatches && actionMatches;
  });

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      added_comment: "text-green-600",
      changed_status: "text-yellow-600",
      changed_priority: "text-red-600",
      assigned_ticket: "text-purple-600",
      created_ticket: "text-blue-600",
    };
    return colors[action] || "text-gray-600";
  };

  const formatActionText = (action: string) => {
    return action.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="added_comment">Comments</SelectItem>
            <SelectItem value="changed_status">Status Changes</SelectItem>
            <SelectItem value="changed_priority">Priority Changes</SelectItem>
            <SelectItem value="assigned_ticket">Assignments</SelectItem>
            <SelectItem value="created_ticket">Created Tickets</SelectItem>
          </SelectContent>
        </Select>

        {date && (
          <Button
            variant="ghost"
            onClick={() => setDate(undefined)}
          >
            Clear Date
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {filteredActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-4 rounded-lg border p-4"
          >
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {format(new Date(activity.createdAt), "PPP p")}
              </p>
              <p className="mt-1">
                <span className="font-medium">{activity.userName}</span>
                {" "}
                <span className={cn("font-medium", getActionColor(activity.action))}>
                  {formatActionText(activity.action)}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {activity.details}
              </p>
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No activities found for the selected filters.
          </div>
        )}
      </div>
    </div>
  );
} 