import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { pusherClient } from "@/lib/pusher";

interface TicketUpdate {
  ticketId: string;
  status: string;
  updatedBy: string;
  timestamp: string;
}

export function useRealtimeTicket(ticketId: string) {
  const router = useRouter();

  useEffect(() => {
    const channel = pusherClient.subscribe(`ticket-${ticketId}`);

    channel.bind("ticket:update", (data: TicketUpdate) => {
      toast.info(
        `Ticket status updated to ${data.status} by ${data.updatedBy}`,
        {
          action: {
            label: "Refresh",
            onClick: () => router.refresh(),
          },
        }
      );
    });

    channel.bind("ticket:comment", () => {
      toast.info("New comment added to ticket", {
        action: {
          label: "Refresh",
          onClick: () => router.refresh(),
        },
      });
    });

    return () => {
      pusherClient.unsubscribe(`ticket-${ticketId}`);
    };
  }, [ticketId, router]);
} 