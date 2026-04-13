import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    viewsAgg,
    topArticles,
    draftCount,
    publishedCount,
    archivedCount,
    recentArticles,
    pendingComments,
    totalReaders,
    categories,
  ] = await Promise.all([
    prisma.article.aggregate({ _sum: { views: true } }),
    prisma.article.findMany({
      take: 10,
      orderBy: { views: "desc" },
      select: { id: true, title: true, slug: true, views: true, status: true, category: { select: { name: true } } },
    }),
    prisma.article.count({ where: { status: "DRAFT" } }),
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.article.count({ where: { status: "ARCHIVED" } }),
    prisma.article.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { category: true, author: { select: { name: true } } },
    }),
    prisma.comment.count({ where: { approved: false } }),
    prisma.reader.count(),
    prisma.category.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { articles: { _count: "desc" } },
    }),
  ]);

  return NextResponse.json({
    totalViews: viewsAgg._sum.views ?? 0,
    topArticles,
    articlesByStatus: { DRAFT: draftCount, PUBLISHED: publishedCount, ARCHIVED: archivedCount },
    recentArticles,
    pendingComments,
    totalReaders,
    topCategories: categories.map((c) => ({ id: c.id, name: c.name, count: c._count.articles })),
  });
}
