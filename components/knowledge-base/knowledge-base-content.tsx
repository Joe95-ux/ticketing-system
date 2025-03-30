"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  articles: Article[];
}

interface KnowledgeBaseContentProps {
  categories: Category[];
}

export function KnowledgeBaseContent({ categories }: KnowledgeBaseContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.map((category) => ({
    ...category,
    articles: category.articles.filter((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.articles.length > 0);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {searchQuery && filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No articles found matching your search.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.articles.map((article) => (
                    <li key={article.id}>
                      <Link
                        href={`/knowledge-base/${category.id}/${article.slug}`}
                        className="text-sm text-muted-foreground hover:text-primary hover:underline"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!searchQuery && (
        <div className="mt-12 text-center">
          <h2 className="text-xl font-semibold mb-4">Can&apos;t find what you&apos;re looking for?</h2>
          <Link
            href="/tickets/new"
            className="text-primary hover:underline"
          >
            Create a support ticket
          </Link>
        </div>
      )}
    </div>
  );
} 