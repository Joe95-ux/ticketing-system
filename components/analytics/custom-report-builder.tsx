"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BarChart, LineChart, PieChart } from "lucide-react";

const metrics = [
  { id: "resolution_time", label: "Resolution Time" },
  { id: "response_time", label: "Response Time" },
  { id: "satisfaction", label: "Customer Satisfaction" },
  { id: "ticket_volume", label: "Ticket Volume" },
];

const dimensions = [
  { id: "agent", label: "By Agent" },
  { id: "category", label: "By Category" },
  { id: "priority", label: "By Priority" },
  { id: "status", label: "By Status" },
];

export function CustomReportBuilder() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [selectedChart, setSelectedChart] = useState<string>("bar");

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label>Date Range</Label>
            <DatePickerWithRange className="w-full" />
          </div>
          <div>
            <Label>Group By</Label>
            <Select value={selectedDimension} onValueChange={setSelectedDimension}>
              <SelectTrigger>
                <SelectValue placeholder="Select dimension" />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map((dimension) => (
                  <SelectItem key={dimension.id} value={dimension.id}>
                    {dimension.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          <Label>Metrics</Label>
          <div className="space-y-2">
            {metrics.map((metric) => (
              <div key={metric.id} className="flex items-center space-x-2">
                <Checkbox
                  id={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={(checked) => {
                    setSelectedMetrics(
                      checked
                        ? [...selectedMetrics, metric.id]
                        : selectedMetrics.filter((id) => id !== metric.id)
                    );
                  }}
                />
                <label
                  htmlFor={metric.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {metric.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label>Chart Type</Label>
        <div className="flex gap-4">
          <Button
            variant={selectedChart === "bar" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setSelectedChart("bar")}
          >
            <BarChart className="h-4 w-4" />
            Bar Chart
          </Button>
          <Button
            variant={selectedChart === "line" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setSelectedChart("line")}
          >
            <LineChart className="h-4 w-4" />
            Line Chart
          </Button>
          <Button
            variant={selectedChart === "pie" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setSelectedChart("pie")}
          >
            <PieChart className="h-4 w-4" />
            Pie Chart
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Reset</Button>
        <Button
          disabled={selectedMetrics.length === 0 || !selectedDimension}
          className="flex items-center gap-2"
        >
          Generate Report
        </Button>
      </div>
    </div>
  );
} 