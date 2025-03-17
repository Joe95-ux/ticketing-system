import { cn } from "@/lib/utils";

export const categoryConfig = {
  GENERAL: {
    label: "General",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  TECHNICAL: {
    label: "Technical",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  BILLING: {
    label: "Billing",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  FEATURE_REQUEST: {
    label: "Feature Request",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  BUG: {
    label: "Bug",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
} as const;

interface CategoryBadgeProps {
  category: keyof typeof categoryConfig;
  className?: string;
  showLabel?: boolean;
}

export function CategoryBadge({ category, className, showLabel = true }: CategoryBadgeProps) {
  const config = categoryConfig[category];
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
      config.color,
      className
    )}>
      {showLabel ? config.label : category}
    </span>
  );
} 