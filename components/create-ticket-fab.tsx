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

  // Improved scroll detection with throttling
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setIsScrolled(window.scrollY > 50);
      }, 100);
    };
    
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (pathname === "/tickets" || status !== "authenticated") return null;

  return (
    <Button
      onClick={() => router.push("/tickets/new")}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 cursor-pointer",
        "transition-all duration-200 ease-in-out shadow-lg",
        "h-14 rounded-full p-4 overflow-hidden",
        "bg-primary text-white font-bold",
        // Base size when scrolled
        isScrolled ? "w-14 gap-0" : "w-14 md:w-auto",
        // Expanded state on hover (regardless of scroll)
        "hover:w-auto hover:rounded-lg"
      )}
    >
      <Plus size={isScrolled ? 28: 24} className="font-bold shrink-0" />
      <span
        className={cn(
          "text-sm font-semibold whitespace-nowrap",
          "transition-all duration-200",
          isScrolled ? "max-w-0 opacity-0" : "max-w-[120px] opacity-100",
          // Always show text on hover
          "group-hover:max-w-[120px] group-hover:opacity-100"
        )}
      >
        Create Ticket
      </span>
    </Button>
  );
}