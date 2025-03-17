"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryConfig } from "./category-badge";
import { useCategoryCounts } from "./category-counts";
import { cn } from "@/lib/utils";

export function CategoryStats() {
  const categoryCounts = useCategoryCounts();
  const total = Object.values(categoryCounts || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(categoryConfig).map(([key, config]) => {
        const count = categoryCounts?.[key as keyof typeof categoryConfig] ?? 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        
        return (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {config.label}
              </CardTitle>
              <span className={cn(
                "text-xs font-medium",
                config.color.split(" ")[1] // Use the text color from categoryConfig
              )}>
                {percentage}%
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <div className="mt-4 h-2 w-full rounded-full bg-muted">
                <div
                  className={cn(
                    "h-2 rounded-full",
                    config.color.split(" ")[0] // Use the background color from categoryConfig
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 