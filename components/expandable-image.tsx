"use client";

import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export function ExpandableImage({ src, alt, className }: ExpandableImageProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <>
      <div className="relative inline-block group">
        <img
          src={src}
          alt={alt || ""}
          className={cn(
            "max-h-[300px] rounded-md object-contain cursor-zoom-in",
            !isLoaded && "blur-sm",
            className
          )}
          onLoad={() => setIsLoaded(true)}
        />
        <button
          onClick={() => setIsOpen(true)}
          className="absolute top-2 right-2 p-1 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-screen-lg h-[90vh] flex items-center justify-center p-0">
          <img
            src={src}
            alt={alt || ""}
            className="max-w-full max-h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 