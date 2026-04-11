import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, author: true, tags: { include: { tag: true } } },
  });

  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, excerpt, content, categoryId, imageUrl, imageAlt, status, featured, tagIds } = body;

  if (!title || !content || !categoryId) {
    return NextResponse.json({ error: "Titel, innehåll och kategori krävs" }, { status: 400 });
  }

  const userId = (session.user as { id?: string }).id!;

  const slug = slugify(title, { lower: true, strict: true, locale: "sv" });

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      categoryId,
      authorId: userId,
      imageUrl,
      imageAlt,
      status: status ?? "DRAFT",
      featured: featured ?? false,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: string) => ({ tagId })) }
        : undefined,
    },
  });

  return NextResponse.json(article, { status: 201 });
}
