import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function GET() {
  const events = await prisma.event.findMany({ orderBy: { startDate: "asc" } });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, location, startDate, endDate, eventType, url, imageUrl } = body;

  if (!title || !startDate) {
    return NextResponse.json({ error: "Titel och datum krävs" }, { status: 400 });
  }

  const slug = slugify(title, { lower: true, strict: true, locale: "sv" });

  const event = await prisma.event.create({
    data: {
      title,
      slug,
      description,
      location,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      eventType: eventType ?? "OTHER",
      url,
      imageUrl,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
