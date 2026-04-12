import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface Props { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  const ad = await prisma.affiliateAd.update({ where: { id }, data });
  return NextResponse.json(ad);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });

  const { id } = await params;
  await prisma.affiliateAd.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
