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
      onClick={() => router.push("/tickets/new")}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center justify-center bg-primary text-white shadow-lg",
        "transition-all duration-300 ease-in-out",
        "hover:shadow-xl",
        isScrolled
          ? "w-14 h-14 rounded-full px-0"
          : "w-auto h-14 rounded-full px-4"
      )}
    >
      <Plus className="h-6 w-6" />
      <span
        className={cn(
          "ml-2 whitespace-nowrap text-base font-semibold transition-all duration-300",
          isScrolled ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
        )}
      >
        Create Ticket
      </span>
    </Button>
  );
}
