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
import { BarChart as BarChartIcon, LineChart as LineChartIcon, PieChart as PieChartIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface Metric {
  id: string;
  label: string;
  unit?: string;
  formatValue?: (value: number) => string;
}

interface Dimension {
  id: string;
  label: string;
}

interface MetricData {
  id: string;
  label: string;
  data: number[];
  categories: string[];
}

interface ReportData {
  metrics: MetricData[];
  dimension: string;
  dateRange: {
    from: string;
    to: string;
  };
}

const CHART_COLORS = ['#0ea5e9', '#f97316', '#8b5cf6', '#ef4444'];

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

const formatPercentage = (value: number) => `${value}%`;

const metrics: Metric[] = [
  { 
    id: "resolution_time", 
    label: "Resolution Time",
    unit: "minutes",
    formatValue: formatTime
  },
  { 
    id: "response_time", 
    label: "Response Time",
    unit: "minutes",
    formatValue: formatTime
  },
  { 
    id: "satisfaction", 
    label: "Customer Satisfaction",
    unit: "%",
    formatValue: formatPercentage
  },
  { 
    id: "ticket_volume", 
    label: "Ticket Volume",
    formatValue: (value) => value.toString()
  },
];

const dimensions: Dimension[] = [
  { id: "agent", label: "By Agent" },
  { id: "category", label: "By Category" },
  { id: "priority", label: "By Priority" },
  { id: "status", label: "By Status" },
];

const categories = {
  agent: ["John", "Sarah", "Mike", "Emma", "Alex"],
  category: ["Technical", "Billing", "Feature Request", "Bug", "General"],
  priority: ["Low", "Medium", "High", "Urgent", "Critical"],
  status: ["Open", "In Progress", "Pending", "Resolved", "Closed"],
};

type ChartData = {
  name: string;
  [key: string]: string | number;
};

type TooltipFormatter = (value: number, name: string) => [string, string];

export function CustomReportBuilder() {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedDimension, setSelectedDimension] = useState<string>("");
  const [selectedChart, setSelectedChart] = useState<string>("bar");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dimensionCategories = categories[selectedDimension as keyof typeof categories] || [];
      
      const sampleData: ReportData = {
        metrics: selectedMetrics.map(metricId => ({
          id: metricId,
          label: metrics.find(m => m.id === metricId)?.label ?? "",
          categories: dimensionCategories,
          data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100)),
        })),
        dimension: dimensions.find(d => d.id === selectedDimension)?.label ?? "",
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

  const renderChart = () => {
    if (!reportData) return null;

    const chartData: ChartData[] = reportData.metrics[0].categories.map((category, index) => ({
      name: category,
      ...reportData.metrics.reduce((acc, metric) => ({
        ...acc,
        [metric.label]: metric.data[index],
      }), {}),
    }));

    const getMetricFormat = (metricId: string) => {
      const metric = metrics.find(m => m.id === metricId);
      return metric?.formatValue || ((value: number) => value.toString());
    };

    const tooltipFormatter: TooltipFormatter = (value, name) => {
      const metric = metrics.find(m => m.label === name);
      const format = metric?.formatValue || ((v: number) => v.toString());
      return [format(value), name];
    };

    switch (selectedChart) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              {reportData.metrics.map((metric, index) => (
                <Bar
                  key={metric.id}
                  dataKey={metric.label}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={tooltipFormatter} />
              <Legend />
              {reportData.metrics.map((metric, index) => (
                <Line
                  key={metric.id}
                  type="monotone"
                  dataKey={metric.label}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              {reportData.metrics.map((metric, metricIndex) => {
                const format = getMetricFormat(metric.id);
                return (
                  <Pie
                    key={metric.id}
                    dataKey="value"
                    nameKey="name"
                    data={metric.categories.map((category, index) => ({
                      name: category,
                      value: metric.data[index],
                    }))}
                    cx={`${25 + (metricIndex * 50)}%`}
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${format(value as number)}`}
                  >
                    {metric.data.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                );
              })}
              <Legend />
              <Tooltip formatter={(value) => [getMetricFormat(reportData.metrics[0].id)(value as number), ""]} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
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
            <BarChartIcon className="h-4 w-4" />
            Bar Chart
          </Button>
          <Button
            variant={selectedChart === "line" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setSelectedChart("line")}
          >
            <LineChartIcon className="h-4 w-4" />
            Line Chart
          </Button>
          <Button
            variant={selectedChart === "pie" ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => setSelectedChart("pie")}
          >
            <PieChartIcon className="h-4 w-4" />
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
          <div className="space-y-6">
            <div className="space-y-2">
              <p><strong>Date Range:</strong> {reportData.dateRange.from} to {reportData.dateRange.to}</p>
              <p><strong>Dimension:</strong> {reportData.dimension}</p>
            </div>
            {renderChart()}
          </div>
        </Card>
      )}
    </div>
  );
} 