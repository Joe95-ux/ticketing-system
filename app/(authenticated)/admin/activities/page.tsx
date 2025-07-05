import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { ActivityWithRelations } from "@/lib/activities";

export const metadata = {
  title: "Activity Log",
  description: "View all system activities",
};

export default async function ActivityLogPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const activities = await db.activityLog.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      ticket: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100, // Limit to last 100 activities
  }) as unknown as ActivityWithRelations[];

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">
          View and monitor all system activities
        </p>
      </div>
      <DataTable data={activities} columns={columns} />
    </div>
  );
} 