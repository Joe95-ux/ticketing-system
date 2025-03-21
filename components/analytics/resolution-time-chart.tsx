"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Week 1", time: 4.8 },
  { name: "Week 2", time: 4.5 },
  { name: "Week 3", time: 4.3 },
  { name: "Week 4", time: 4.2 },
  { name: "Week 5", time: 4.0 },
  { name: "Week 6", time: 3.8 },
];

export function ResolutionTimeChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Resolution Time Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                className="text-sm text-muted-foreground"
              />
              <YAxis
                className="text-sm text-muted-foreground"
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Average Time
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {payload[0].value}h
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="time"
                strokeWidth={2}
                activeDot={{
                  r: 6,
                  className: "fill-primary",
                }}
                className="stroke-primary"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 