import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const { variant } = await req.json();

  if (variant !== "A" && variant !== "B") {
    return NextResponse.json({ error: "variant must be A or B" }, { status: 400 });
  }

  const test = await prisma.headlineTest.findUnique({ where: { id } });
  if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment the appropriate counter
  const updated = await prisma.headlineTest.update({
    where: { id },
    data: variant === "A" ? { viewsA: { increment: 1 } } : { viewsB: { increment: 1 } },
  });

  // Auto-pick winner at 500 total views
  const total = updated.viewsA + updated.viewsB;
  if (total >= 500 && !updated.winner && updated.active) {
    const rateA = updated.viewsA / total;
    const rateB = updated.viewsB / total;
    await prisma.headlineTest.update({
      where: { id },
      data: { winner: rateA >= rateB ? "A" : "B", active: false },
    });
  }

  return NextResponse.json({ ok: true });
}
