"use client";

import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div
      className={cn(
        "prose dark:prose-invert max-w-none",
        "[&_img]:max-w-full [&_img]:rounded-md [&_img]:my-4",
        "[&_p]:my-3 [&_p]:leading-7",
        "[&_ul]:my-6 [&_ul]:list-disc [&_ul]:pl-6",
        "[&_ol]:my-6 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_li]:my-2",
        "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4",
        "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:my-4",
        "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-3",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4",
        "[&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:my-4",
        "[&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded",
        "[&_hr]:my-8 [&_hr]:border-border",
        "[&_table]:w-full [&_table]:my-6",
        "[&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted",
        "[&_td]:border [&_td]:border-border [&_td]:p-2",
        className
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
} 