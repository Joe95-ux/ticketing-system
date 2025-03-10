import { Metadata } from "next";
import { CreateTicketForm } from "@/components/tickets/create-ticket-form";

export const metadata: Metadata = {
  title: "Create Ticket | Ticketing System",
  description: "Create a new support ticket",
};

export default function NewTicketPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create Ticket</h1>
        <p className="text-muted-foreground">
          Fill out the form below to create a new support ticket.
        </p>
      </div>
      <CreateTicketForm />
    </div>
  );
} 