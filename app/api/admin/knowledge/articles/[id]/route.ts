import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import slugify from "slugify";

const updateArticleSchema = z.object({
  title: z.string().min(1).max(200),
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1),
  categoryId: z.string().min(1),
});

type ParamType = Promise<{id: string}>;

export async function PATCH(
  req: Request,
  { params }: { params: ParamType }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const json = await req.json();
    const body = updateArticleSchema.parse(json);

    // Generate a URL-friendly slug from the title
    const slug = slugify(body.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Check if the category exists
    const category = await db.knowledgeCategory.findUnique({
      where: { id: body.categoryId },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }
    const {id} = await params;

    // Update the article
    const article = await db.knowledgeArticle.update({
      where: { id },
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt,
        content: body.content,
        categoryId: body.categoryId,
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 422 });
    }

    console.error("Error updating article:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: ParamType}
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const {id} = await params;
    // Delete the article
    await db.knowledgeArticle.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting article:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 