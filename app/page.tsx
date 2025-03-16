"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  const url = session ? "/dashboard" : "/register";
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-3xl space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Modern Ticket Management
        </h1>
        <p className="text-xl text-muted-foreground">
          Streamline your support workflow with our intuitive ticket management system.
          Track issues, collaborate with your team, and resolve tickets efficiently
          with blockchain-powered tracking.
        </p>
        <div className="space-y-4">
              <Button
                size="lg"
                className="h-12 px-8 text-lg"
                asChild
              >
                <Link href={url}>
                  Get Started
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                {session ? "Continue to dashboard" : "No account required to try"}
              </p>
            </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Simple & Intuitive</h2>
            <p className="text-muted-foreground">
              Easy-to-use interface designed for efficient ticket management
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Blockchain Powered</h2>
            <p className="text-muted-foreground">
              Immutable ticket history with transparent tracking
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Team Collaboration</h2>
            <p className="text-muted-foreground">
              Work together seamlessly with built-in commenting and updates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
