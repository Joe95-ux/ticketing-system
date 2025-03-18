"use client";

import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { X } from "lucide-react";

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Process images after render
  useEffect(() => {
    if (!containerRef.current) return;

    const processImages = () => {
      const images = containerRef.current?.getElementsByTagName("img") || [];
      Array.from(images).forEach((img) => {
        // Skip if image is already processed
        if (img.parentElement?.classList.contains('image-processed')) return;
        
        const src = img.getAttribute("src");
        if (!src) return;

        // Create expandable image wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "relative inline-block group my-4 image-processed";
        wrapper.style.maxWidth = "600px";
        wrapper.style.width = "100%";

        // Create preview image container for aspect ratio
        const imageContainer = document.createElement("div");
        imageContainer.className = "relative w-full";
        imageContainer.style.minHeight = "100px";

        // Create preview image
        const previewImg = document.createElement("img");
        previewImg.src = src;
        previewImg.alt = img.alt || "";
        previewImg.className = "max-h-[400px] w-full rounded-md object-contain";
        previewImg.style.maxWidth = "600px";

        // Create expand button with icon
        const expandButton = document.createElement("button");
        expandButton.className = "absolute top-3 right-3 p-2 rounded-md bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background border shadow-sm dark:border-border";
        expandButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;
        expandButton.setAttribute("aria-label", "View full size image");

        // Add click handlers
        const handleExpand = (e: Event) => {
          e.stopPropagation();
          setExpandedImage(src);
        };
        expandButton.addEventListener("click", handleExpand);
        previewImg.addEventListener("click", handleExpand);

        // Add loading state
        previewImg.style.opacity = "0";
        previewImg.style.transition = "opacity 0.2s ease-in-out";
        previewImg.onload = () => {
          previewImg.style.opacity = "1";
        };

        // Assemble and replace
        imageContainer.appendChild(previewImg);
        wrapper.appendChild(imageContainer);
        wrapper.appendChild(expandButton);
        img.parentNode?.replaceChild(wrapper, img);
      });
    };

    // Initial processing
    processImages();

    // Setup observer for dynamic content changes
    const observer = new MutationObserver(processImages);
    observer.observe(containerRef.current, { 
      childList: true, 
      subtree: true 
    });

    // Cleanup function
    return () => {
      observer.disconnect();
      if (containerRef.current) {
        const buttons = containerRef.current.getElementsByTagName("button");
        Array.from(buttons).forEach(button => {
          button.removeEventListener("click", () => {});
        });
      }
    };
  }, [content]);

  // Sanitize the HTML content
  const sanitizedContent = DOMPurify.sanitize(content);

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
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
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