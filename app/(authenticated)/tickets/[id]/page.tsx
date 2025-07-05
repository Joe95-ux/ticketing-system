import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ErrorFallback } from "@/components/error-fallback";
import { TicketContent } from "./ticket-content";
import type { Metadata } from "next";

type TicketPageProps = Promise<{
  id: string;
}>

export async function generateMetadata(props: { params: TicketPageProps }): Promise<Metadata> {
  const {id} = await props.params;
  const ticket = await db.ticket.findUnique({
    where: { id},
    select: { id: true, title: true, description: true },
  });

  if (!ticket) {
    return {
      title: "Ticket Not Found",
      description: "The requested ticket could not be found.",
    };
  }

  return {
    title: `Ticket #${ticket.id} - ${ticket.title}`,
    description: ticket.description || "No description provided",
  };
}

export default async function TicketPage(props: { params: TicketPageProps }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/signin");
  const {id} = await props.params;

  const ticket = await db.ticket.findUnique({
    where: { id},
    include: {
      createdBy: true,
      assignedTo: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
      activityLogs: {
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ticket) return <ErrorFallback message="Ticket not found" />;

  return <TicketContent ticket={ticket} />;
}
