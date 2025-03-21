import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | TixHub",
  description: "View detailed analytics and metrics for your support system.",
};

interface AnalyticsLayoutProps {
  children: React.ReactNode;
}

export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  return <>{children}</>;
} 