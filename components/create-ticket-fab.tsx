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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/tickets" || status !== "authenticated") return null;

  return (
    <Button
      className={cn(
        "fixed bottom-6 right-6 z-50 shadow-lg",
        // Base styles
        "h-14 w-14 rounded-full p-0", // Mobile default (circle)
        "md:w-auto md:px-4 md:rounded-full", // Desktop default
        // Shape transition (smooth morphing between circle and pill)
        "transition-[width,border-radius,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        // Hover effects
        "hover:shadow-xl hover:scale-[1.02]",
        "transition-all duration-200 ease-out",
        // Scroll state
        isScrolled 
          ? "md:w-14 md:px-0" // Scrolled - force circle
          : "md:hover:w-[140px] md:hover:rounded-lg" // Desktop hover pill
      )}
      onClick={() => router.push("/tickets/new")}
    >
      <Plus className={cn(
        "h-6 w-6 shrink-0",
        "md:h-5 md:w-5",
        // Icon scaling transition
        "transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        !isScrolled && "md:scale-90"
      )} />
      <span className={cn(
        "hidden whitespace-nowrap overflow-hidden",
        "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        // Text animation
        !isScrolled 
          ? "md:inline-block md:max-w-[100px] md:opacity-100 md:ml-2" 
          : "md:max-w-0 md:opacity-0 md:ml-0",
        "font-medium"
      )}>
        Create Ticket
      </span>
    </Button>
  );
}