"use client";

import { UserRoleManager } from "@/components/admin/user-role-manager";
import { AddUserForm } from "@/components/admin/add-user-form";


interface UserProps{
    id: string;
    name: string | null;
    email: string;
    role: "ADMIN" | "SUPPORT" | "USER";
}

export function UsersClientWrapper({ users }: { users: UserProps[] }) {
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