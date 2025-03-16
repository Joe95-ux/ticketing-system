"use client";

import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import { useState } from "react";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession(); 

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar mobileOpen={isMobileOpen} onMobileOpenChange={setIsMobileOpen} />
      <div className="flex-1 flex flex-col">
        <Navbar onMobileMenuClick={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
