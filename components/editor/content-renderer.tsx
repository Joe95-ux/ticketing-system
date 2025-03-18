"use client";

import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  // Configure DOMPurify to allow certain tags and attributes
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'h1', 'h2',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img'
    ],
    ALLOWED_ATTR: ['href', 'src', 'class', 'alt', 'target', 'rel'],
  });

  return (
    <div 
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        // Style links
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        // Style code blocks
        "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none",
        // Style blockquotes
        "prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:not-italic",
        // Style images
        "prose-img:rounded-md prose-img:max-w-full prose-img:h-auto",
        className
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
} 