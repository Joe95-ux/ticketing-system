"use client";

import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CreateTicketFAB() {
  const router = useRouter();
  const pathname = usePathname();
  const { status } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  // Only show on authenticated pages except the tickets page
  if (pathname === "/tickets" || status !== "authenticated") {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Button
      className={cn(
        "fixed bottom-6 right-6 shadow-lg transition-all duration-200 ease-in-out",
        "hover:shadow-xl hover:scale-105",
        "md:px-6 md:gap-2",
        isScrolled
          ? "w-14 h-14 rounded-full"
          : "h-14 rounded-full md:rounded-full md:hover:rounded-lg md:w-auto"
      )}
      onClick={() => router.push("/tickets/new")}
    >
      <Plus className={cn(
        "h-6 w-6 transition-transform",
        "md:h-5 md:w-5",
        !isScrolled && "md:scale-90"
      )} />
      <span className={cn(
        "hidden",
        !isScrolled && "md:inline-block",
        "transition-opacity duration-200",
        "font-medium"
      )}>
        Create Ticket
      </span>
      <span className="sr-only">Create New Ticket</span>
    </Button>
  );
} 