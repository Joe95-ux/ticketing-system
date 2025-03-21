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
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BarChart, LineChart, PieChart } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleReset = () => {
    setSelectedMetrics([]);
    setSelectedDimension("");
    setSelectedChart("bar");
    setDateRange({ from: new Date(), to: new Date() });
    setReportData(null);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call with sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sampleData = {
        metrics: selectedMetrics.map(metricId => ({
          id: metricId,
          label: metrics.find(m => m.id === metricId)?.label,
          data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
        })),
        dimension: dimensions.find(d => d.id === selectedDimension)?.label,
        dateRange: {
          from: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '',
          to: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '',
        },
      };

      setReportData(sampleData);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label>Date Range</Label>
            <DatePickerWithRange 
              className="w-full" 
              value={dateRange}
              onChange={setDateRange}
            />
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
        <Button variant="outline" onClick={handleReset}>Reset</Button>
        <Button
          disabled={selectedMetrics.length === 0 || !selectedDimension || !dateRange?.from || !dateRange?.to || isGenerating}
          onClick={handleGenerateReport}
          className="flex items-center gap-2"
        >
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>
      </div>

      {reportData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Generated Report</h3>
          <div className="space-y-4">
            <p><strong>Date Range:</strong> {reportData.dateRange.from} to {reportData.dateRange.to}</p>
            <p><strong>Dimension:</strong> {reportData.dimension}</p>
            <div>
              <strong>Metrics:</strong>
              <ul className="list-disc list-inside mt-2">
                {reportData.metrics.map((metric: any) => (
                  <li key={metric.id}>
                    {metric.label}: {metric.data.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 