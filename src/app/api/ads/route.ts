import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const position = req.nextUrl.searchParams.get("position");
  const ads = await prisma.affiliateAd.findMany({
    where: {
      active: true,
      ...(position ? { position: position as "SIDEBAR" | "INLINE" } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(ads);
}
