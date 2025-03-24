import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";
import { Inter } from "next/font/google";
import { ClientProviders } from "@/providers/client-providers";
import NexTopLoader from "nextjs-toploader";
import { CreateTicketFAB } from "@/components/create-ticket-fab";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NexTopLoader color="#3B82F6" showSpinner={false}/>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientProviders session={session}>
            {children}
            <CreateTicketFAB />
            <Toaster richColors closeButton position="top-right" />
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
