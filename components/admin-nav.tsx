import { Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { buttonVariants } from "../components/ui/button";

export function AdminNav() {
  return (
    <nav className="flex space-x-2">
      <Link
        to="/admin/activities"
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