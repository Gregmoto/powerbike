import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

function getIpHash(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  return createHash("sha256").update(ip).digest("hex");
}

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params;
  const counts = await prisma.reaction.groupBy({
    by: ["type"],
    where: { articleId: id },
    _count: true,
  });
  const result = { THUMBS_UP: 0, FIRE: 0 };
  for (const c of counts) result[c.type] = c._count;
  return NextResponse.json(result);
}

export async function POST(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const { type } = await req.json();

  if (type !== "THUMBS_UP" && type !== "FIRE") {
    return NextResponse.json({ error: "Ogiltig reaktion" }, { status: 400 });
  }

  const ipHash = getIpHash(req);

  const existing = await prisma.reaction.findUnique({
    where: { articleId_ipHash_type: { articleId: id, ipHash, type } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
    return NextResponse.json({ toggled: false });
  }

  await prisma.reaction.create({ data: { articleId: id, ipHash, type } });
  return NextResponse.json({ toggled: true });
}
