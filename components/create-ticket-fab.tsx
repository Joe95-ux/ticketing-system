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

  // Track scroll position
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname === "/tickets" || status !== "authenticated") return null;

  return (
    <Button
      onClick={() => router.push("/tickets/new")}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center justify-center",
        "transition-all duration-300 ease-in-out shadow-lg",
        "h-14 rounded-full p-0",
        "bg-primary text-white",
        // Expand to pill shape on hover if not scrolled
        !isScrolled ? 
          "w-14 md:hover:w-40 md:px-4" : 
          "w-14 px-0",
        // Rounded adjustment on hover
        !isScrolled ? 
          "md:hover:rounded-lg" : 
          "rounded-full"
      )}
    >
      <Plus className="h-6 w-6 transition-transform duration-300" />
      <span
        className={cn(
          "ml-2 overflow-hidden whitespace-nowrap text-base font-semibold transition-all duration-300",
          isScrolled ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100"
        )}
      >
        Create Ticket
      </span>
    </Button>
  );
}
