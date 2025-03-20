"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu, Search, Filter, Loader2, X, LogIn } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { categoryConfig } from "@/components/tickets/category-badge";
import { cn } from "@/lib/utils";
import Logo from "@/components/logo";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

interface SearchResponse {
  tickets: TicketResult[];
  categoryCounts: Record<string, number>;
}

interface TicketResult {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
}

interface NavbarProps {
  onMobileMenuClick: () => void;
}

interface CategoryConfig {
  label: string;
  color: string;
  icon?: LucideIcon;
}

export function Navbar({ onMobileMenuClick }: NavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<TicketResult[]>([]);
  const [activeFilters, setActiveFilters] = useState<{
    category?: string;
    status?: string;
  }>({});
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const pathname = usePathname();
  const isHomepage = pathname === "/";

  // Reset search state when dialog closes
  useEffect(() => {
    if (!showSearchDialog) {
      setSearchQuery("");
      setResults([]);
      setCategoryCounts({});
      setActiveFilters({});
      // Abort any ongoing fetch requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [showSearchDialog]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Add keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowSearchDialog((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Debounced search handler
  const debouncedSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (!query.trim() && !activeFilters.category && !activeFilters.status) {
        setResults([]);
        return;
      }

      // Abort previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      setIsSearching(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.append("q", query);
        if (activeFilters.category) params.append("category", activeFilters.category);
        if (activeFilters.status) params.append("status", activeFilters.status);

        const response = await fetch(`/api/tickets/search?${params.toString()}`, {
          signal: abortControllerRef.current.signal
        });
        
        if (!response.ok) throw new Error('Search failed');
        const data: SearchResponse = await response.json();
        
        // Only update state if the modal is still open
        if (showSearchDialog) {
          setResults(data.tickets);
          setCategoryCounts(data.categoryCounts);
        }
      } catch (error) {
        // Only show errors if they're not from aborting the request
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Search error:', error);
          setResults([]);
          setCategoryCounts({});
        }
      } finally {
        if (showSearchDialog) {
          setIsSearching(false);
        }
      }
    },
    [activeFilters, showSearchDialog]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && showSearchDialog) {
        debouncedSearch(searchQuery);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearch, showSearchDialog]);

  // Update the input handler to just update the query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Navigate to ticket and close dialog
  const handleSelectTicket = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
    setShowSearchDialog(false);
  };

  const handleFilterToggle = (type: 'status' | 'category', value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (prev[type] === value) {
        delete newFilters[type];
      } else {
        newFilters[type] = value;
      }
      return newFilters;
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Logo - only visible on mobile */}
          <Logo />
          {/* Search bar */}
          {session && (
            <div className={cn("hidden md:flex flex-1 max-w-lg", isHomepage && "ml-auto mr-auto")}>
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground h-9 px-3 gap-2"
              onClick={() => setShowSearchDialog(true)}
            >
              <Search className="h-4 w-4" />
              <span>Search tickets...</span>
              <div className="flex-1" />
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          )}
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          {session && (
            <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setShowSearchDialog(true)}
          >
            <Search className="h-5 w-5" />
          </Button>
          )}
          

          {/* Theme toggle */}
          <ModeToggle />

          {/* Show login/signup buttons if not logged in */}
          {!session && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">
                  Sign Up
                </Link>
              </Button>
            </>
          )}

          {/* Show profile dropdown if logged in */}
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Search Tickets</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 overflow-y-auto pr-4 custom-scrollbar" style={{
            '--scrollbar-size': '7px',
          } as React.CSSProperties}>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
                <Input 
                  placeholder="Search tickets..." 
                  className="flex-1"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Active Filters */}
              {(activeFilters.status || activeFilters.category) && (
                <div className="flex gap-2 flex-wrap">
                  {activeFilters.status && (
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => handleFilterToggle('status', activeFilters.status!)}
                    >
                      {activeFilters.status.toLowerCase()}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  )}
                  {activeFilters.category && (
                    <Badge 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleFilterToggle('category', activeFilters.category!)}
                    >
                      {categoryConfig[activeFilters.category as keyof typeof categoryConfig].label}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  )}
                </div>
              )}

              {/* Quick Filters */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Status Filters</div>
                <div className="grid grid-cols-2 gap-2">
                  {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => (
                    <Button
                      key={status}
                      variant={activeFilters.status === status ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleFilterToggle('status', status)}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      {status.replace('_', ' ').toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Category Filters */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Categories</div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(categoryConfig as Record<string, CategoryConfig>).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={activeFilters.category === key ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleFilterToggle('category', key)}
                    >
                      <div className={cn(
                        "p-1 rounded mr-2",
                        config.color.split(" ")[0],
                        "flex items-center justify-center"
                      )}>
                        {'icon' in config && config.icon && (
                          <config.icon className={cn(
                            "h-4 w-4",
                            config.color.split(" ")[1]
                          )} />
                        )}
                      </div>
                      {config.label}
                      {categoryCounts[key] > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {categoryCounts[key]}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Search Results */}
              {results.length > 0 && (
                <div className="rounded-md border">
                  <div className="space-y-2 p-2">
                    {results.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => handleSelectTicket(ticket.id)}
                        className="w-full text-left p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{ticket.title}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline">{ticket.status.toLowerCase()}</Badge>
                              <Badge 
                                variant="secondary"
                                className={cn(
                                  categoryConfig[ticket.category as keyof typeof categoryConfig]?.color.split(" ")[0],
                                  "text-white"
                                )}
                              >
                                {categoryConfig[ticket.category as keyof typeof categoryConfig]?.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                by {ticket.createdBy.name} • {new Date(ticket.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {((searchQuery || activeFilters.status || activeFilters.category) && !isSearching && results.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tickets found matching your criteria.
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </header>
  );
}