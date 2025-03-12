"use client";

import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { BlockchainProvider } from "@/contexts/blockchain-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
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
        <SessionProvider>
          <BlockchainProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors closeButton position="top-right" />
            </ThemeProvider>
          </BlockchainProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
