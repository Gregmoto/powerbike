import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { articleId: id, approved: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, content: true, createdAt: true },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const { name, email, content } = await req.json();

  if (!name?.trim() || !email?.includes("@") || !content?.trim()) {
    return NextResponse.json({ error: "Fyll i alla fält korrekt" }, { status: 400 });
  }

  if (content.length > 1000) {
    return NextResponse.json({ error: "Kommentaren är för lång (max 1000 tecken)" }, { status: 400 });
  }

  const article = await prisma.article.findUnique({ where: { id, status: "PUBLISHED" } });
  if (!article) return NextResponse.json({ error: "Artikeln hittades inte" }, { status: 404 });

  await prisma.comment.create({
    data: { name: name.trim(), email: email.trim(), content: content.trim(), articleId: id },
  });

  return NextResponse.json({ message: "Tack! Din kommentar granskas innan publicering." });
}
