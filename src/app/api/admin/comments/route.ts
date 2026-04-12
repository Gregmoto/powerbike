import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });

  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: { article: { select: { title: true, slug: true } } },
  });
  return NextResponse.json(comments);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });

  const { id, approved } = await req.json();
  const comment = await prisma.comment.update({ where: { id }, data: { approved } });
  return NextResponse.json(comment);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });

  const { id } = await req.json();
  await prisma.comment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
