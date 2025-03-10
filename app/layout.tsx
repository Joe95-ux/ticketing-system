"use client";

import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { BlockchainProvider } from "@/contexts/blockchain-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <BlockchainProvider>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </BlockchainProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
