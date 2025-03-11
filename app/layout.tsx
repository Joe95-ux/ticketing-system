"use client";

import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { BlockchainProvider } from "@/contexts/blockchain-context";
import { Toaster } from "sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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
          </ThemeProvider>
            <Toaster richColors closeButton position="top-right" />
          </BlockchainProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
