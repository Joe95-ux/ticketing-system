"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamically import Dialog components with ssr disabled
const Dialog = dynamic(() => import('@/components/ui/dialog').then(mod => mod.Dialog), {
  ssr: false
});

const DialogContent = dynamic(() => import('@/components/ui/dialog').then(mod => mod.DialogContent), {
  ssr: false
});

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const processedRef = useRef(false);

  const processImages = useCallback(() => {
    if (!contentRef.current || processedRef.current) return;
    
    const images = contentRef.current.querySelectorAll('img:not(.processed)');
    images.forEach((img) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'relative inline-block max-w-[600px]';
      
      // Mark the image as processed
      img.classList.add('processed');
      img.className = 'rounded-md max-w-full h-auto max-h-[400px] object-contain ' + img.className;
      
      const expandButton = document.createElement('button');
      expandButton.className = 'absolute top-2 right-2 p-1.5 rounded-md bg-white/90 shadow-sm border border-gray-200 dark:bg-gray-900/90 dark:border-gray-700';
      expandButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
      
      const imgSrc = img.getAttribute('src');
      if (imgSrc) {
        expandButton.setAttribute('data-image-src', imgSrc);
        expandButton.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          setExpandedImage(imgSrc);
        };
      }
      
      // Replace the image with the wrapper containing the image and button
      const parent = img.parentNode;
      if (parent) {
        wrapper.appendChild(img);
        wrapper.appendChild(expandButton);
        parent.replaceChild(wrapper, wrapper);
      }
    });
    
    processedRef.current = true;
  }, []);

  // Process images after content is rendered
  useEffect(() => {
    processImages();
  }, [processImages, content]);

  // Reset processed state when content changes
  useEffect(() => {
    processedRef.current = false;
  }, [content]);

  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'h1', 'h2',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img'
    ],
    ALLOWED_ATTR: ['href', 'src', 'class', 'alt', 'target', 'rel'],
  });

  return (
    <>
      <div 
        ref={contentRef}
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none",
          "prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:not-italic",
          className
        )}
        dangerouslySetInnerHTML={{ __html: clean }}
      />
      
      <Dialog open={!!expandedImage} onOpenChange={(open) => {
        if (!open) {
          setExpandedImage(null);
          // Reset processed state to ensure images are reprocessed
          processedRef.current = false;
          // Reprocess images after dialog closes
          setTimeout(processImages, 0);
        }
      }}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
          {expandedImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <Image 
                src={expandedImage} 
                alt="Expanded view"
                className="max-w-full max-h-[95vh] object-contain"
                width={1200}
                height={800}
                priority
              />
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setExpandedImage(null)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 