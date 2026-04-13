import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id },
    include: { category: true, author: true, tags: { include: { tag: true } } },
  });

  if (!article) return NextResponse.json({ error: "Hittades inte" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, excerpt, content, categoryId, imageUrl, imageAlt, status, featured, tagIds, publishAt, summary } = body;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Hittades inte" }, { status: 404 });

  const slug = title !== existing.title
    ? slugify(title, { lower: true, strict: true, locale: "sv" })
    : existing.slug;

  // Uppdatera taggar
  await prisma.articleTag.deleteMany({ where: { articleId: id } });

  const article = await prisma.article.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      content,
      categoryId,
      imageUrl,
      imageAlt,
      status,
      featured,
      publishedAt: status === "PUBLISHED" && !existing.publishedAt ? new Date() : existing.publishedAt,
      publishAt: publishAt ? new Date(publishAt) : null,
      summary: summary ?? null,
      tags: tagIds?.length
        ? { create: tagIds.map((tagId: string) => ({ tagId })) }
        : undefined,
    },
  });

  return NextResponse.json(article);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
