import { Metadata } from "next";
import { TicketsPageContent } from "./tickets-page";

export const metadata: Metadata = {
  title: "Tickets | Ticketing System",
  description: "Manage your support tickets",
};

export default function TicketsPage() {
  return <TicketsPageContent />;
} 