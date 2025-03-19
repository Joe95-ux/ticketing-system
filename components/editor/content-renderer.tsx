"use client";

import { useState, useCallback } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Configure DOMPurify to allow certain tags and attributes
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'h1', 'h2',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img'
    ],
    ALLOWED_ATTR: ['href', 'src', 'class', 'alt', 'target', 'rel'],
  });

  const processImages = useCallback((htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    doc.querySelectorAll('img').forEach((img) => {
      if (img.parentElement?.classList.contains('image-processed')) return;
      
      const wrapper = document.createElement('div');
      wrapper.className = 'image-processed relative group inline-block max-w-[600px]';
      
      const newImg = img.cloneNode(true) as HTMLImageElement;
      newImg.className = 'rounded-md max-w-full h-auto max-h-[400px] object-contain';
      
      const expandButton = document.createElement('button');
      expandButton.className = 'absolute top-2 right-2 p-1.5 rounded-md bg-white/90 shadow-sm border border-gray-200 dark:bg-gray-900/90 dark:border-gray-700';
      expandButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize-2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
      expandButton.setAttribute('data-image-src', img.src);
      expandButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const src = (e.currentTarget as HTMLButtonElement).getAttribute('data-image-src');
        if (src) setExpandedImage(src);
      };
      
      wrapper.appendChild(newImg);
      wrapper.appendChild(expandButton);
      img.replaceWith(wrapper);
    });
    
    return doc.body.innerHTML;
  }, []);

  return (
    <>
      <div 
        className={cn(
          "prose prose-sm dark:prose-invert max-w-none",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none",
          "prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:not-italic",
          className
        )}
        dangerouslySetInnerHTML={{ __html: processImages(clean) }}
      />
      
      <Dialog open={!!expandedImage} onOpenChange={() => setExpandedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
          {expandedImage && (
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={expandedImage} 
                alt="Expanded view"
                className="max-w-full max-h-[95vh] object-contain"
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