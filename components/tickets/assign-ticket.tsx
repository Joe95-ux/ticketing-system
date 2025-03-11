"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User } from "@prisma/client";

interface AssignTicketProps {
  ticketId: string;
  currentAssignee?: string | null;
  users: User[];
}

export function AssignTicket({ ticketId, currentAssignee, users }: AssignTicketProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState(currentAssignee || "");

  async function handleAssign() {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to assign ticket");
      }

      toast.success("Ticket assigned successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to assign ticket");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-end gap-4">
      <div className="flex-1">
        <Select
          value={selectedUser}
          onValueChange={setSelectedUser}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select user to assign" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button 
        onClick={handleAssign} 
        disabled={isLoading || !selectedUser || selectedUser === currentAssignee}
      >
        {isLoading ? "Assigning..." : "Assign"}
      </Button>
    </div>
  );
} 