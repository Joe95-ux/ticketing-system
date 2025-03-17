"use client";

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketList } from "@/components/tickets/ticket-list";
import { CategoryFilter } from "@/components/tickets/category-filter";
import Link from "next/link";
import { Ticket } from "@/types";
import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export function TicketsPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
  });

  // Fetch tickets when category or page changes
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        // Clear tickets before fetching new ones
        setTickets([]);
        
        const url = new URL("/api/tickets", window.location.origin);
        if (selectedCategory) {
          url.searchParams.set("category", selectedCategory);
        }
        url.searchParams.set("page", pagination.page.toString());
        url.searchParams.set("limit", pagination.limit.toString());
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }
        
        const data = await response.json();
        setTickets(data.tickets);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        // Clear tickets on error
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [selectedCategory, pagination.page, pagination.limit]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    // Reset to page 1 when category changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tickets</h1>
        <Button asChild>
          <Link href="/tickets/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Ticket
          </Link>
        </Button>
      </div>
      
      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      
      <TicketList tickets={tickets} isLoading={isLoading} />

      {pagination.pages > 1 && !isLoading && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page > 1) {
                    handlePageChange(pagination.page - 1);
                  }
                }}
              />
            </PaginationItem>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === pagination.page}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page < pagination.pages) {
                    handlePageChange(pagination.page + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
} 