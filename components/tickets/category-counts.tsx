"use client";

import { useEffect, useState } from "react";
import { categoryConfig } from "./category-badge";

type CategoryCounts = {
  [K in keyof typeof categoryConfig]: number;
};

export function useCategoryCounts() {
  const [counts, setCounts] = useState<CategoryCounts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      // If we're already loading or if it's been less than 30 seconds since last fetch, skip
      const now = Date.now();
      if (isLoading || (lastFetchTime && now - lastFetchTime < 30000)) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/tickets/category-counts');
        const data = await response.json();
        setCounts(data);
        setLastFetchTime(now);
      } catch (error) {
        console.error('Failed to fetch category counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
    // Refresh counts every minute, but only if the component is mounted
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, [isLoading, lastFetchTime]);

  return counts;
} 