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
  PanelRightOpen,
  MessageCircle,
  Wrench,
  CreditCard,
  Lightbulb,
  Bug,
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
import { categoryConfig } from "@/components/tickets/category-badge";
import { useCategoryCounts } from "@/components/tickets/category-counts";

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

// Update the scrollbar styles
const scrollbarStyles = `
  [data-scrollbar]::-webkit-scrollbar {
    width: 8px;
  }

  [data-scrollbar]::-webkit-scrollbar-track {
    background: transparent;
  }

  [data-scrollbar]::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground) / 0.3);
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: content-box;
  }

  [data-scrollbar]::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground) / 0.5);
  }

  [data-scrollbar] {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
  }
`;

export function Sidebar({ mobileOpen = false, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { counts: categoryCounts } = useCategoryCounts();

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

  const categories = Object.entries(categoryConfig).map(([key, config]) => {
    const IconComponent = {
      GENERAL: MessageCircle,
      TECHNICAL: Wrench,
      BILLING: CreditCard,
      FEATURE_REQUEST: Lightbulb,
      BUG: Bug,
    }[key] || MessageCircle;

    return {
      label: config.label,
      icon: IconComponent,
      href: `/tickets/categories/${key.toLowerCase()}`,
      color: config.color,
      count: categoryCounts?.[key as keyof typeof categoryConfig] ?? 0,
    };
  });

  return (
    <>
      <style jsx global>{scrollbarStyles}</style>
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
        "transition-all duration-200 ease-in-out",
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
            <Ticket className="h-6 w-6 dark:text-white text-black" />
            {!isCollapsed && (
              <span className="font-mono text-xl tracking-tight dark:text-white text-black">
                TixHub
              </span>
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
            <PanelRightOpen className={cn(
              "h-5 w-5 transition-transform duration-200",
              isCollapsed && "rotate-180"
            )} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto transition-all py-4" data-scrollbar>
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

            {/* Categories section - show on both dashboard and tickets pages */}
            {!pathname.includes('/auth') && (
              <>
                <div className={cn(
                  "mt-4 mb-2 px-3 text-xs font-semibold text-muted-foreground",
                  isCollapsed && "text-center"
                )}>
                  {!isCollapsed && "CATEGORIES"}
                </div>
                {categories.map((category) => (
                  <Link
                    key={category.href}
                    href={category.href}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground group",
                      pathname === category.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-1 rounded",
                        category.color.split(" ")[0],
                        "flex items-center justify-center"
                      )}>
                        <category.icon className={cn(
                          "h-4 w-4",
                          category.color.split(" ")[1]
                        )} />
                      </div>
                      {!isCollapsed && category.label}
                    </div>
                    {!isCollapsed && category.count > 0 && (
                      <span className={cn(
                        "min-w-[1.5rem] rounded-full px-1.5 py-0.5 text-xs text-center",
                        pathname === category.href
                          ? "bg-background text-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground"
                      )}>
                        {category.count}
                      </span>
                    )}
                  </Link>
                ))}
              </>
            )}
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