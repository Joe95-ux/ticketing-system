import { TicketList } from "@/components/tickets/ticket-list";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Loading...</h1>
      </div>
      <TicketList tickets={[]} isLoading={true} />
    </div>
  );
} 