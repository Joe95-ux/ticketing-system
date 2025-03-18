"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
  backPath?: string;
}

export function ErrorFallback({
  error,
  resetError,
  message = "Something went wrong",
  backPath
}: ErrorFallbackProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
      <h2 className="text-2xl font-semibold mb-4">{message}</h2>
      {error && (
        <p className="text-sm text-muted-foreground mb-6">
          {error.message}
        </p>
      )}
      <div className="flex gap-4">
        {resetError && (
          <Button onClick={resetError} variant="default">
            Try again
          </Button>
        )}
        {backPath && (
          <Button
            onClick={() => router.push(backPath)}
            variant="outline"
          >
            Go back
          </Button>
        )}
      </div>
    </div>
  );
} 