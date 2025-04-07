import { Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "../lib/utils";
import { buttonVariants } from "../components/ui/button";

export function AdminNav() {
  return (
    <nav className="flex space-x-2">
      <Link
        href="/admin/activities"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "justify-start"
        )}
      >
        <Activity className="mr-2 h-4 w-4" />
        Activity Log
      </Link>
    </nav>
  );
} 