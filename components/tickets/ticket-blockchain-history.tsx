"use client";

import * as React from "react";
import { useBlockchain } from "@/contexts/blockchain-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

interface BlockchainEvent {
  event: string;
  status?: string;
  creator?: string;
  timestamp: number;
  transactionHash: string;
}

interface TicketBlockchainHistoryProps {
  ticketId: string;
}

export function TicketBlockchainHistory({ ticketId }: TicketBlockchainHistoryProps) {
  const [events, setEvents] = React.useState<BlockchainEvent[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { contract } = useBlockchain();

  React.useEffect(() => {
    async function fetchEvents() {
      if (!contract) return;

      try {
        // Fetch all events and filter manually
        const creationFilter = contract.filters.TicketCreated();
        const updateFilter = contract.filters.TicketUpdated();

        const [creationEvents, updateEvents] = await Promise.all([
          contract.queryFilter(creationFilter),
          contract.queryFilter(updateFilter)
        ]);

        // Filter and map creation events
        const filteredCreationEvents = creationEvents
          .filter(event => event.args?.ticketId === ticketId)
          .map(event => ({
            event: "TicketCreated",
            status: event.args?.status,
            creator: event.args?.creator,
            timestamp: Number(event.args?.timestamp),
            transactionHash: event.transactionHash,
          }));

        // Filter and map update events
        const filteredUpdateEvents = updateEvents
          .filter(event => event.args?.ticketId === ticketId)
          .map(event => ({
            event: "TicketUpdated",
            status: event.args?.status,
            timestamp: Number(event.args?.timestamp),
            transactionHash: event.transactionHash,
          }));

        // Combine and sort all events
        const allEvents = [...filteredCreationEvents, ...filteredUpdateEvents]
          .sort((a, b) => b.timestamp - a.timestamp);

        setEvents(allEvents);
      } catch (error) {
        console.error("Failed to fetch blockchain events:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [contract, ticketId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blockchain History</CardTitle>
          <CardDescription>Loading transaction history...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blockchain History</CardTitle>
        <CardDescription>
          Track all blockchain transactions related to this ticket
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.transactionHash}
              className="flex flex-col space-y-2 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {event.event === "TicketCreated" ? "Created" : "Updated"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(event.timestamp * 1000), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {event.status && (
                <div className="text-sm">Status: {event.status}</div>
              )}
              {event.creator && (
                <div className="text-sm">Creator: {event.creator}</div>
              )}
              <a
                href={`https://etherscan.io/tx/${event.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                View on Etherscan
              </a>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-center text-sm text-muted-foreground">
              No blockchain transactions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 