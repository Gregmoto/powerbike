import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });

  const ads = await prisma.affiliateAd.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(ads);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Ej inloggad" }, { status: 401 });

  const data = await req.json();
  const ad = await prisma.affiliateAd.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      price: data.price ?? null,
      buttonText: data.buttonText || "Köp här",
      url: data.url,
      position: data.position ?? "SIDEBAR",
      active: data.active ?? true,
    },
  });
  return NextResponse.json(ad);
}
