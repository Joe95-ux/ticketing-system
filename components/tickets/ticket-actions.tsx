"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"
import { User } from "@/types";
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
  DialogFooter,
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
import { MoreVertical, UserPlus, Wallet, Pencil, Trash2 } from "lucide-react";
import { useBlockchain } from "@/contexts/blockchain-context";
import { useState } from "react";
import { TicketWithRelations } from "./ticket-details";

interface TicketActionsProps {
  ticket: TicketWithRelations;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
}

export function TicketActions({ ticket, canEdit, canDelete, onEdit }: TicketActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { isConnected, connect, createTicket, updateTicketStatus } = useBlockchain();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showAssignDialog, setShowAssignDialog] = React.useState(false);
  const [supportUsers, setSupportUsers] = React.useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch support users when dialog opens
  const fetchSupportUsers = React.useCallback(async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/users/support");
      if (!res.ok) {
        throw new Error("Failed to fetch support users");
      }
      const data = await res.json();
      setSupportUsers(data);
    } catch (error) {
      console.error("Failed to fetch support users:", error);
      toast.error("Failed to load support users. Please try again.");
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  React.useEffect(() => {
    if (showAssignDialog) {
      fetchSupportUsers();
    }
  }, [showAssignDialog, fetchSupportUsers]);

  const canManageTicket =
    session?.user.role === "ADMIN" ||
    session?.user.role === "SUPPORT" ||
    session?.user.id === ticket.userId ||
    session?.user.id === ticket.assignedId;

  const handleStatusUpdate = async (status: string) => {
    setIsLoading(true);

    try {
      // Ensure wallet is connected first
      if (!isConnected) {
        await connect();
        // After connecting, wait a brief moment for the connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Double-check connection after potential connect
      if (!isConnected) {
        throw new Error("Failed to connect to blockchain. Please try again.");
      }

      // Try to update status on blockchain
      let txHash;
      try {
        txHash = await updateTicketStatus(ticket.id, status);
      } catch (error: Error | unknown) {
        // Check if the error is because the ticket doesn't exist
        if (error instanceof Error && error.message.includes("Ticket does not exist")) {
          // Create the ticket first
          try {
            console.log("Creating ticket on blockchain first...");
            const createTxHash = await createTicket(ticket.id);
            if (!createTxHash) {
              throw new Error("Failed to create ticket on blockchain");
            }
            
            // Wait for the transaction to be mined
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Now try to update the status again
            txHash = await updateTicketStatus(ticket.id, status);
          } catch (createError) {
            console.error("Failed to create ticket on blockchain:", createError);
            throw new Error("Failed to initialize ticket on blockchain");
          }
        } else {
          // If it's a different error, rethrow it
          throw error;
        }
      }

      if (!txHash) {
        throw new Error("Blockchain update failed - no transaction hash received");
      }

      // Then update in database
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, txHash }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update ticket in database");
      }

      // const data = await response.json();

      toast.success("Ticket status has been updated successfully");
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
        body: JSON.stringify({ assignedId: userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign ticket");
      }

      toast.success("Ticket has been assigned successfully");
      setShowAssignDialog(false);
      router.refresh();
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to assign ticket");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete ticket');
      }

      toast.success("Ticket has been deleted successfully");
      
      // Navigate to tickets list and refresh the data
      router.push('/tickets');
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete the ticket. Please try again.");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
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
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
            </div>
          ) : supportUsers.length > 0 ? (
            <Select onValueChange={(value) => assignTicket(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {supportUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center py-2">
                No support agents available
              </p>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={fetchSupportUsers}
                disabled={isLoadingUsers}
              >
                Retry
              </Button>
            </div>
          )}
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
          <DropdownMenuSeparator />
          {canEdit && (
            <DropdownMenuItem
              onClick={onEdit}
              disabled={isLoading}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Ticket
            </DropdownMenuItem>
          )}
          {canDelete && (
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isLoading}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Ticket
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 