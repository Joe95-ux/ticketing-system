"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { BlockchainProvider } from "@/contexts/blockchain-context";

export function ClientProviders({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return <SessionProvider session={session}><BlockchainProvider>{children}</BlockchainProvider></SessionProvider>;
}
