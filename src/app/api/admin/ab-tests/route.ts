import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tests = await prisma.headlineTest.findMany({
    orderBy: { createdAt: "desc" },
    include: { article: { select: { title: true, slug: true } } },
  });

  return NextResponse.json(tests);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { articleId, titleB } = await req.json();
  if (!articleId || !titleB) {
    return NextResponse.json({ error: "articleId och titleB krävs" }, { status: 400 });
  }

  const test = await prisma.headlineTest.create({
    data: { articleId, titleB },
    include: { article: { select: { title: true, slug: true } } },
  });

  return NextResponse.json(test, { status: 201 });
}
