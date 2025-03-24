"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export function CreateTicketFAB() {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();

  // Only show on authenticated pages except the tickets page
  if (pathname === "/tickets" || status !== "authenticated") {
    return null;
  }

  return (
    <Button
      className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
      onClick={() => router.push("/tickets/new")}
      size="icon"
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Create New Ticket</span>
    </Button>
  );
} 