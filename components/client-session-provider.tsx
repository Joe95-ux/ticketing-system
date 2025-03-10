"use client";

import { useSession } from "next-auth/react";

interface ClientSessionProviderProps {
  children: (session: any) => React.ReactNode;
}

export function ClientSessionProvider({ children }: ClientSessionProviderProps) {
  const { data: session } = useSession();
  return children(session);
} 