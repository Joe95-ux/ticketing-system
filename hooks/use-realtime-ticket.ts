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
    if (!ticketId) return;

    const channelName = `ticket-${ticketId}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("ticket:update", (data: TicketUpdate) => {
      let shouldRefresh = false;

      if (data.status) {
        toast.info(`${data.updatedBy} changed status to ${data.status}`);
        soundManager.playNotification();
        shouldRefresh = true;
      }

      if (data.priority) {
        toast.info(`${data.updatedBy} changed priority to ${data.priority}`);
        soundManager.playNotification();
        shouldRefresh = true;
      }

      if (data.assignedTo) {
        toast.info(`${data.updatedBy} assigned ticket to ${data.assignedTo}`);
        soundManager.playNotification();
        shouldRefresh = true;
      }

      if (shouldRefresh) router.refresh();
    });

    channel.bind("ticket:comment", (data: TicketUpdate) => {
      if (data.comment) {
        toast.info(`${data.updatedBy} added a comment`);
        soundManager.playComment();
        router.refresh();
      }
    });

    return () => {
      channel.unbind("ticket:update");
      channel.unbind("ticket:comment");
      pusherClient.unsubscribe(channelName);
    };
  }, [ticketId]);

  return initialData;
}
