import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { KnowledgeManagement } from "@/components/admin/knowledge-management";

export const metadata: Metadata = {
  title: "Knowledge Base Management",
  description: "Manage knowledge base categories and articles",
};

export default async function KnowledgeManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const categories = await db.knowledgeCategory.findMany({
    include: {
      articles: {
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          content: true,
          updatedAt: true,
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
          <h1 className="text-3xl font-bold">Knowledge Base Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage categories and articles in the knowledge base
          </p>
        </div>

        <KnowledgeManagement categories={categories} />
      </div>
    </div>
  );
} 