import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(tags);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "name och slug krävs" }, { status: 400 });

  const tag = await prisma.tag.upsert({
    where: { slug },
    update: {},
    create: { name, slug },
  });

  return NextResponse.json(tag, { status: 201 });
}
