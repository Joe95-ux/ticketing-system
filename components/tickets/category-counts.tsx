"use client";

import { useEffect, useState } from "react";
import { categoryConfig } from "./category-badge";

type CategoryCounts = {
  [K in keyof typeof categoryConfig]: number;
};

export function useCategoryCounts() {
  const [counts, setCounts] = useState<CategoryCounts | null>(null);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/tickets/category-counts');
        const data = await response.json();
        setCounts(data);
      } catch (error) {
        console.error('Failed to fetch category counts:', error);
      }
    };

    fetchCounts();
    // Refresh counts every minute
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  return counts;
} 