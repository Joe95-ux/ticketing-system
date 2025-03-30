import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

interface ArticlePageProps {
  params: {
    categoryId: string;
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const article = await db.knowledgeArticle.findFirst({
    where: {
      categoryId: params.categoryId,
      slug: params.slug,
    },
    select: {
      title: true,
      excerpt: true,
    },
  });

  if (!article) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
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

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = !match;
      return isInline ? (
        <code {...props} className={className}>
          {children}
        </code>
      ) : (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    },
  };

  return (
    <div className="container max-w-4xl py-6 lg:py-10">
      <Button
        variant="ghost"
        asChild
        className="mb-6"
      >
        <Link href="/knowledge-base">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Knowledge Base
        </Link>
      </Button>

      <article className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="mb-4">{article.title}</h1>
        <div className="text-muted-foreground mb-8">
          {article.excerpt}
        </div>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {article.content}
        </ReactMarkdown>
      </article>

      <div className="mt-8 border-t pt-8">
        <p className="text-sm text-muted-foreground">
          Category: {article.category.name}
        </p>
        <p className="text-sm text-muted-foreground">
          Last updated: {article.updatedAt.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
} 