import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityBarChart } from "./activity-bar-chart";

export default async function AnalyticsPage() {
  // ... existing session check ...

  const [tickets, activities] = await Promise.all([
    db.ticket.findMany({
      include: {
        createdBy: true,
        assignedTo: true,
      },
    }),
    db.activityLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  // Activity metrics
  const activityByType = activities.reduce((acc, activity) => {
    acc[activity.action] = (acc[activity.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activityByUser = activities.reduce((acc, activity) => {
    const userName = activity.user.name || activity.user.email;
    acc[userName] = (acc[userName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostActiveUsers = Object.entries(activityByUser)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // ... existing ticket metrics ...

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          View system metrics and activity trends
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* ... existing overview content ... */}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activities.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Most Common Action
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {Object.entries(activityByType)
                    .sort(([, a], [, b]) => b - a)[0][0]
                    .replace(/_/g, " ")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Most Active User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mostActiveUsers[0]?.[0]}
                </div>
                <p className="text-xs text-muted-foreground">
                  {mostActiveUsers[0]?.[1]} activities
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Activity Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(activities.length / tickets.length).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Activities per ticket
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ActivityBarChart data={activityByType} />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Top Contributors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mostActiveUsers.map(([user, count]) => (
                    <div key={user} className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{user}</p>
                        <p className="text-sm text-muted-foreground">
                          {count} activities
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {((count / activities.length) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          {/* ... existing tickets content ... */}
        </TabsContent>
      </Tabs>
    </div>
  );
} 