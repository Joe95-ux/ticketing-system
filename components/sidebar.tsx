"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Ticket,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WalletStatus } from "@/components/wallet-status";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Tickets",
    icon: Ticket,
    href: "/tickets",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function Sidebar({ mobileOpen = false, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle initial state based on screen size
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile) {
        // On mobile: reset collapse state and hide sidebar
        setIsCollapsed(false);
        onMobileOpenChange?.(false);
      } else {
        // On desktop: show sidebar
        onMobileOpenChange?.(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onMobileOpenChange]);

  return (
    <>
      {/* Backdrop for mobile - only shown when sidebar is open */}
      {isMobile && mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => onMobileOpenChange?.(false)}
        />
      )}
      <div className={cn(
        "flex h-full flex-col bg-card border-r z-30",
        "fixed md:sticky top-0 left-0",
        "w-64 md:w-auto",
        "transition-all duration-200",
        isCollapsed && !isMobile && "md:w-16",
        !mobileOpen && "-translate-x-full md:translate-x-0"
      )}>
        <div className={cn(
          "flex h-14 items-center border-b px-4",
          isCollapsed && "justify-center px-2"
        )}>
          <Link href="/dashboard" className={cn(
            "flex items-center gap-2",
            isCollapsed && "justify-center"
          )}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            {!isCollapsed && (
              <span className="font-semibold">Ticketing System</span>
            )}
          </Link>
        </div>

        {/* Collapse Toggle - Only show on desktop */}
        <div className="hidden md:flex justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid gap-1 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === route.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <route.icon className="h-4 w-4" />
                {!isCollapsed && route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={cn(
          "border-t p-4",
          isCollapsed && "p-2"
        )}>
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            {!isCollapsed && <WalletStatus />}
          </div>
          <div className={cn(
            "mt-4 flex items-center",
            isCollapsed ? "justify-center" : "gap-4"
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">{session?.user?.name}</span>
                <span className="text-xs text-muted-foreground">
                  {session?.user?.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 