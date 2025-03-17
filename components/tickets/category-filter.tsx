"use client";

import { categoryConfig } from "./category-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "text-muted-foreground",
          !selectedCategory && "bg-accent text-accent-foreground"
        )}
        onClick={() => onCategoryChange(null)}
      >
        All
      </Button>
      {Object.entries(categoryConfig).map(([key, config]) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          className={cn(
            selectedCategory === key && "bg-accent text-accent-foreground"
          )}
          onClick={() => onCategoryChange(key)}
        >
          {config.label}
        </Button>
      ))}
    </div>
  );
} 