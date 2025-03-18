"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoryConfig } from "./category-badge";
import { useCategoryCounts } from "./category-counts";
import { cn } from "@/lib/utils";

type Category = keyof typeof categoryConfig;

export function CategoryStats() {
  const { counts } = useCategoryCounts();
  const total = counts ? Object.values(counts).reduce((a: number, b: number) => a + b, 0) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {(Object.entries(categoryConfig) as [Category, typeof categoryConfig[Category]][]).map(([key, config]) => {
        const count = (counts && key in counts) ? counts[key] : 0;
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        
        return (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {config.label}
              </CardTitle>
              <span className={cn(
                "text-xs font-medium",
                config.color.split(" ")[1]
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
                    config.color.split(" ")[0]
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