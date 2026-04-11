import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, color } = await req.json();
  if (!name) return NextResponse.json({ error: "Namn krävs" }, { status: 400 });

  const slug = slugify(name, { lower: true, strict: true, locale: "sv" });

  const category = await prisma.category.create({ data: { name, slug, color } });
  return NextResponse.json(category, { status: 201 });
}
