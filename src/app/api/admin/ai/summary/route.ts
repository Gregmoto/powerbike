import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ summary: "Sätt ANTHROPIC_API_KEY i Vercel-miljövariabler." });
  }

  const { articleId, title, content } = await req.json();
  if (!title || !content) return NextResponse.json({ error: "Titel och innehåll krävs" }, { status: 400 });

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });

    const plainContent = (content as string).replace(/<[^>]+>/g, " ").slice(0, 2000);

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Skriv en TL;DR-sammanfattning med exakt 3 punkter på svenska för denna motorcykelartikel. Titel: "${title}". Innehåll: "${plainContent}". Returnera ENDAST 3 rader som börjar med • (bullet). En mening per rad. Inga andra tecken.`,
        },
      ],
    });

    const summary = message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // Save to DB if articleId is provided
    if (articleId) {
      await prisma.article.update({
        where: { id: articleId },
        data: { summary },
      });
    }

    return NextResponse.json({ summary });
  } catch (err) {
    console.error("AI summary error:", err);
    return NextResponse.json({ error: "AI-fel" }, { status: 500 });
  }
}
