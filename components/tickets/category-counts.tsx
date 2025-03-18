"use client";

import { useEffect, useState } from "react";
import { categoryConfig } from "./category-badge";
import { TICKET_EVENTS } from "@/lib/events";

type CategoryCounts = {
  [K in keyof typeof categoryConfig]: number;
};

// Cache the counts in memory
let cachedCounts: CategoryCounts | null = null;

export function useCategoryCounts() {
  const [counts, setCounts] = useState<CategoryCounts | null>(cachedCounts);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const url = new URL('/api/tickets/category-counts', window.location.origin);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch counts: ${response.statusText}`);
        }
        
        const data = await response.json();
        cachedCounts = data;
        setCounts(data);
      } catch (error) {
        console.error('Failed to fetch category counts:', error);
        // If we have cached data, keep using it
        if (cachedCounts && !counts) {
          setCounts(cachedCounts);
        }
      }
    };

    // Fetch counts on mount
    fetchCounts();

    // Listen for ticket creation events
    const handleTicketCreated = () => {
      fetchCounts();
    };

    window.addEventListener(TICKET_EVENTS.CREATED, handleTicketCreated);
    return () => window.removeEventListener(TICKET_EVENTS.CREATED, handleTicketCreated);
  }, [counts]);

  return { counts };
} 