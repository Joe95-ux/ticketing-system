"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Ticket, User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MoreVertical, UserPlus, Wallet } from "lucide-react";
import { useBlockchain } from "@/contexts/blockchain-context";

interface TicketActionsProps {
  ticket: Ticket;
}

export function TicketActions({ ticket }: TicketActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isConnected, connect, updateTicketStatus } = useBlockchain();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showAssignDialog, setShowAssignDialog] = React.useState(false);
  const [supportUsers, setSupportUsers] = React.useState<User[]>([]);

  // Fetch support users when dialog opens
  React.useEffect(() => {
    if (showAssignDialog) {
      fetch("/api/users/support")
        .then((res) => res.json())
        .then((data) => setSupportUsers(data))
        .catch((error) => {
          console.error("Failed to fetch support users:", error);
          toast.error("Failed to load support users");
        });
    }
  }, [showAssignDialog]);

  const canManageTicket =
    session?.user.role === "ADMIN" ||
    session?.user.role === "SUPPORT" ||
    session?.user.id === ticket.userId;

  const handleStatusUpdate = async (status: string) => {
    if (!isConnected) {
      try {
        await connect();
      } catch (error) {
        toast.error("Please connect your wallet to update the ticket.");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Update status on blockchain first
      const txHash = await updateTicketStatus(ticket.id, status);
      if (!txHash) {
        throw new Error("Blockchain update failed");
      }

      // Then update in database
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, txHash }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update ticket");
      }

      toast.success("Ticket status has been updated.");
      router.refresh();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update ticket status");
    } finally {
      setIsLoading(false);
    }
  };

  const assignTicket = async (userId: string) => {
    if (!userId) {
      toast.error("Please select a user to assign the ticket to.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/tickets/${ticket.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign ticket");
      }

      toast.success("Ticket has been assigned successfully.");
      setShowAssignDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to assign ticket");
    } finally {
      setIsLoading(false);
    }
  };

  if (!canManageTicket) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {!isConnected && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => connect()}
          disabled={isLoading}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      )}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Assign
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Ticket</DialogTitle>
            <DialogDescription>
              Select a support agent to assign this ticket to.
            </DialogDescription>
          </DialogHeader>
          <Select onValueChange={(value) => assignTicket(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {supportUsers.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
              {supportUsers.length === 0 && (
                <SelectItem value="" disabled>
                  No support agents available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </DialogContent>
      </Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ticket.status !== "OPEN" && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate("OPEN")}
              disabled={isLoading}
            >
              Mark as Open
            </DropdownMenuItem>
          )}
          {ticket.status !== "IN_PROGRESS" && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate("IN_PROGRESS")}
              disabled={isLoading}
            >
              Mark as In Progress
            </DropdownMenuItem>
          )}
          {ticket.status !== "RESOLVED" && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate("RESOLVED")}
              disabled={isLoading}
            >
              Mark as Resolved
            </DropdownMenuItem>
          )}
          {ticket.status !== "CLOSED" && (
            <DropdownMenuItem
              onClick={() => handleStatusUpdate("CLOSED")}
              disabled={isLoading}
            >
              Mark as Closed
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
} 