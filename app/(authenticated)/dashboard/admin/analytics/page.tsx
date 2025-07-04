import { getActivities } from "@/lib/activities";
import { ActivityTrendChart } from "./activity-trend-chart";
import { ActivityLog } from "./activity-log";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyticsPage() {
  const activities = await getActivities();

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Analytics & Activity</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Activity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTrendChart activities={activities} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityLog activities={activities} />
        </CardContent>
      </Card>
    </div>
  );
} 