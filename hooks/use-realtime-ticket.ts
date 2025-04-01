"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { pusherClient } from "@/lib/pusher";
import { soundManager } from "@/components/audio/notification-sounds";
import type { Ticket, User, Comment } from "@prisma/client";

interface TicketUpdate {
  ticketId: string;
  updatedBy: string;
  timestamp: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  comment?: string;
}

interface TicketWithRelations extends Ticket {
  createdBy: User;
  assignedTo: User | null;
  comments: (Comment & { user: User })[];
}

export function useRealtimeTicket(ticketId: string, initialData: TicketWithRelations) {
  const router = useRouter();

  useEffect(() => {
    const channel = pusherClient.subscribe(`ticket-${ticketId}`);

    channel.bind("ticket:update", (data: TicketUpdate) => {
      if (data.status) {
        toast.info(`${data.updatedBy} changed status to ${data.status}`);
        soundManager.playNotification();
        router.refresh();
      }
      if (data.priority) {
        toast.info(`${data.updatedBy} changed priority to ${data.priority}`);
        soundManager.playNotification();
        router.refresh();
      }
      if (data.assignedTo) {
        toast.info(`${data.updatedBy} assigned ticket to ${data.assignedTo}`);
        soundManager.playNotification();
        router.refresh();
      }
    });

    channel.bind("ticket:comment", (data: TicketUpdate) => {
      if (data.comment) {
        toast.info(`${data.updatedBy} added a comment`);
        soundManager.playComment();
        router.refresh();
      }
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`ticket-${ticketId}`);
    };
  }, [ticketId, router]);

  return initialData;
} 