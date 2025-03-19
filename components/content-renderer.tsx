"use client";

import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { X } from "lucide-react";

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(content);

  // Modify the content to wrap images with a custom structure
  const processedContent = sanitizedContent.replace(
    /<img([^>]+)>/g,
    (match, attributes) => {
      const srcMatch = attributes.match(/src="([^"]+)"/);
      const src = srcMatch ? srcMatch[1] : "";
      const altMatch = attributes.match(/alt="([^"]*)"/);
      const alt = altMatch ? altMatch[1] : "";

      return `
        <div class="relative inline-block group my-4 image-processed" style="max-width: 600px; width: 100%;" data-src="${src}">
          <div class="relative w-full" style="min-height: 100px;">
            <img
              src="${src}"
              alt="${alt}"
              class="max-h-[400px] w-full rounded-md object-contain cursor-pointer"
              style="max-width: 600px;"
            />
          </div>
          <button
            class="absolute top-3 right-3 p-2 rounded-md bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background border shadow-sm dark:border-border"
            aria-label="View full size image"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
        </div>
      `;
    }
  );

  // Handle clicks on images or buttons using event delegation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const imageWrapper = target.closest(".image-processed") as HTMLElement | null;

      if (imageWrapper) {
        const src = imageWrapper.getAttribute("data-src");
        if (src) {
          setExpandedImage(src);
        }
      }
    };

    container.addEventListener("click", handleClick);

    // Cleanup
    return () => {
      container.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          "prose dark:prose-invert max-w-none",
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
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />

      <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-fit h-fit flex items-center justify-center p-0 border-none bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <DialogTitle asChild>
            <VisuallyHidden>Image Preview</VisuallyHidden>
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          {expandedImage && (
            <img
              src={expandedImage}
              alt="Expanded view"
              className="max-w-full max-h-[95vh] object-contain rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}