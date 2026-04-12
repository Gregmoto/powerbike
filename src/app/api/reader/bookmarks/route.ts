import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);

async function getReaderId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("reader_token")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.id as string;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const readerId = await getReaderId(req);
  if (!readerId) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });

  const bookmarks = await prisma.bookmark.findMany({
    where: { readerId },
    orderBy: { createdAt: "desc" },
    include: { article: { include: { category: true } } },
  });
  return NextResponse.json(bookmarks.map((b) => b.article));
}

export async function POST(req: NextRequest) {
  const readerId = await getReaderId(req);
  if (!readerId) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });

  const { articleId } = await req.json();
  const existing = await prisma.bookmark.findUnique({
    where: { readerId_articleId: { readerId, articleId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.bookmark.create({ data: { readerId, articleId } });
  return NextResponse.json({ bookmarked: true });
}
