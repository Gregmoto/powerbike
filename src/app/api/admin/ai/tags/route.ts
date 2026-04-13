import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import slugify from "slugify";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ tags: [] });
  }

  const { title, content } = await req.json();
  if (!title && !content) return NextResponse.json({ error: "Titel eller innehåll krävs" }, { status: 400 });

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });

    // Strip HTML for AI context
    const plainContent = (content as string).replace(/<[^>]+>/g, " ").slice(0, 1000);

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Föreslå 5 svenska taggar för denna motorcykelartikel. Titel: "${title}". Innehåll: "${plainContent}". Returnera ENDAST en JSON-array med 5 strängvärden, inga förklaringar. Exempel: ["motorcykel","säkerhet","hjälm","körning","utrustning"]`,
        },
      ],
    });

    const text = message.content[0].type === "text" ? message.content[0].text.trim() : "[]";
    let tagNames: string[] = [];
    try {
      tagNames = JSON.parse(text);
    } catch {
      // Try to extract array from text
      const match = text.match(/\[[\s\S]*?\]/);
      if (match) tagNames = JSON.parse(match[0]);
    }

    if (!Array.isArray(tagNames)) tagNames = [];

    // Find or create tags in DB
    const tags = await Promise.all(
      tagNames.slice(0, 5).map(async (name: string) => {
        const slug = slugify(name, { lower: true, strict: true, locale: "sv" });
        return prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { name, slug },
        });
      })
    );

    return NextResponse.json({ tags });
  } catch (err) {
    console.error("AI tags error:", err);
    return NextResponse.json({ error: "AI-fel" }, { status: 500 });
  }
}
