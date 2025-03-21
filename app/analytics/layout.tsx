"use client";

import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { useMobile } from "@/hooks/useMobile";

interface AnalyticsLayoutProps {
  children: React.ReactNode;
}

export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  const { isMobileOpen, setIsMobileOpen } = useMobile();

  return (
    <div className="flex min-h-screen">
      {/* Backdrop for mobile sidebar */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/70 z-40"
        />
      )}
      {/* Sidebar with mobile state */}
      <div className={`fixed top-0 left-0 h-screen w-64 transition-transform duration-300 ease-in-out z-50 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Sidebar mobileOpen={isMobileOpen} onMobileOpenChange={setIsMobileOpen} />
      </div>
      <div className="flex-1 flex flex-col">
        {/* Navbar with mobile toggle */}
        <Navbar onMobileMenuClick={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 