import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import { AddUserForm } from "@/components/admin/add-user-form";

export const metadata: Metadata = {
  title: "User Management",
  description: "Manage user roles and permissions",
};

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions for the ticketing system.
          </p>
        </div>
        <AddUserForm />
      </div>
      <UserRoleManager users={users} />
    </div>
  );
} 