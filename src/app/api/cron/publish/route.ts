import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const articles = await prisma.article.findMany({
    where: {
      status: "DRAFT",
      publishAt: { lte: now },
    },
  });

  if (articles.length === 0) {
    return NextResponse.json({ published: 0 });
  }

  await prisma.article.updateMany({
    where: {
      id: { in: articles.map((a) => a.id) },
    },
    data: {
      status: "PUBLISHED",
      publishedAt: now,
    },
  });

  return NextResponse.json({ published: articles.length });
}
