"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TicketList } from "@/components/tickets/ticket-list";
import { CategoryFilter } from "@/components/tickets/category-filter";
import { Ticket } from "@/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function TicketsPageContent() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10,
  });

  useEffect(() => {

    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        setTickets([]);

        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
        });

        if (selectedCategory) params.set("category", selectedCategory);

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tickets?${params.toString()}`);

        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setTickets(data.tickets);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setTickets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [selectedCategory, pagination.page, pagination.limit]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
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
        onCategoryChange={setSelectedCategory}
      />

      <TicketList tickets={tickets} isLoading={isLoading} />

      {pagination.pages > 1 && !isLoading && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              />
            </PaginationItem>
            {Array.from({ length: pagination.pages }, (_, i) => (
              <PaginationItem key={i + 1}>
                <PaginationLink
                  isActive={i + 1 === pagination.page}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
