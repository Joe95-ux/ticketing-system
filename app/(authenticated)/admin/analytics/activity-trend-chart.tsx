"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface ActivityTrendChartProps {
  activities: {
    createdAt: Date;
    action: string;
  }[];
  days?: number;
}

export function ActivityTrendChart({ activities, days = 14 }: ActivityTrendChartProps) {
  const dateRange = eachDayOfInterval({
    start: subDays(new Date(), days - 1),
    end: new Date(),
  });

  const activityByDate = dateRange.map(date => {
    const dayActivities = activities.filter(activity => 
      format(new Date(activity.createdAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

    return {
      date: format(date, "MMM dd"),
      total: dayActivities.length,
      comments: dayActivities.filter(a => a.action === "added_comment").length,
      status: dayActivities.filter(a => a.action === "changed_status").length,
      priority: dayActivities.filter(a => a.action === "changed_priority").length,
      assignments: dayActivities.filter(a => a.action === "assigned_ticket").length,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={activityByDate}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                      {label}
                    </span>
                    {payload.map((item) => (
                      <div key={item.dataKey} className="flex justify-between gap-2">
                        <span className="capitalize">{item.dataKey}:</span>
                        <span className="font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          strokeWidth={2}
          stroke="#0ea5e9"
          name="Total"
        />
        <Line
          type="monotone"
          dataKey="comments"
          strokeWidth={2}
          stroke="#22c55e"
          name="Comments"
        />
        <Line
          type="monotone"
          dataKey="status"
          strokeWidth={2}
          stroke="#f59e0b"
          name="Status"
        />
        <Line
          type="monotone"
          dataKey="priority"
          strokeWidth={2}
          stroke="#ef4444"
          name="Priority"
        />
        <Line
          type="monotone"
          dataKey="assignments"
          strokeWidth={2}
          stroke="#8b5cf6"
          name="Assignments"
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 