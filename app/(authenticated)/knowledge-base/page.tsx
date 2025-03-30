import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { KnowledgeBaseContent } from "@/components/knowledge-base/knowledge-base-content";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description:
    "Find answers to common questions and learn how to use our system effectively",
};

export default async function KnowledgeBasePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const categories = await db.knowledgeCategory.findMany({
    include: {
      articles: {
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          updatedAt: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Find answers to common questions and learn how to use our system
            effectively
          </p>
        </div>

        <KnowledgeBaseContent categories={categories} />
      </div>
    </div>
  );
}
