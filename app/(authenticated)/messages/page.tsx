import { Metadata } from "next";
import { MessagesView } from "@/components/messages/messages-view";

export const metadata: Metadata = {
  title: "Messages",
  description: "View and manage your messages.",
};

export default function MessagesPage() {
  return <MessagesView />;
} 