import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ArticlePageProps {
  params: {
    categoryId: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await db.knowledgeArticle.findFirst({
    where: {
      categoryId: params.categoryId,
      slug: params.slug,
    },
  });

  return {
    title: article?.title || "Article Not Found",
    description: article?.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const article = await db.knowledgeArticle.findFirst({
    where: {
      categoryId: params.categoryId,
      slug: params.slug,
    },
    include: {
      category: true,
    },
  });

  if (!article) {
    redirect("/knowledge-base");
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex flex-col gap-6">
        <div>
          <Link href="/knowledge-base">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Base
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{article.title}</h1>
          <p className="text-muted-foreground mt-2">{article.excerpt}</p>
          <div className="text-sm text-muted-foreground mt-4">
            Category: {article.category.name} • Last updated:{" "}
            {new Date(article.updatedAt).toLocaleDateString()}
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        <div className="mt-8 pt-8 border-t">
          <h2 className="text-xl font-semibold mb-4">Still need help?</h2>
          <Link href="/tickets/new">
            <Button>Create a Support Ticket</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 