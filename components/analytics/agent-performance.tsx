"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const data = [
  {
    agent: "John Doe",
    resolvedTickets: 145,
    avgResponseTime: "10m",
    satisfaction: 98,
    status: "Active",
  },
  {
    agent: "Jane Smith",
    resolvedTickets: 132,
    avgResponseTime: "12m",
    satisfaction: 96,
    status: "Active",
  },
  {
    agent: "Mike Johnson",
    resolvedTickets: 128,
    avgResponseTime: "15m",
    satisfaction: 94,
    status: "Active",
  },
  {
    agent: "Sarah Wilson",
    resolvedTickets: 112,
    avgResponseTime: "18m",
    satisfaction: 92,
    status: "Away",
  },
  {
    agent: "Tom Brown",
    resolvedTickets: 98,
    avgResponseTime: "20m",
    satisfaction: 90,
    status: "Active",
  },
];

export function AgentPerformance() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Agent Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead className="text-right">Resolved</TableHead>
              <TableHead className="text-right">Avg. Response</TableHead>
              <TableHead className="text-right">Satisfaction</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.agent}>
                <TableCell className="font-medium">{item.agent}</TableCell>
                <TableCell className="text-right">{item.resolvedTickets}</TableCell>
                <TableCell className="text-right">{item.avgResponseTime}</TableCell>
                <TableCell className="text-right">{item.satisfaction}%</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={item.status === "Active" ? "default" : "secondary"}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 