"use client";

import { Session } from "next-auth";
import { useSession } from "next-auth/react";

interface ClientSessionProviderProps {
  children: (session: Session | null) => React.ReactNode;
}

export function ClientSessionProvider({ children }: ClientSessionProviderProps) {
  const { data: session } = useSession();
  return children(session);
} 