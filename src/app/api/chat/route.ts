import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ response: "AI-chatten är inte konfigurerad ännu." });
  }

  const { message, history } = await req.json();
  if (!message) return NextResponse.json({ error: "message krävs" }, { status: 400 });

  try {
    const recentArticles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      take: 5,
      orderBy: { publishedAt: "desc" },
      select: { title: true, excerpt: true, content: true },
    });

    const articleContext = recentArticles
      .map((a) => {
        const text = a.content.replace(/<[^>]+>/g, " ").slice(0, 500);
        return `Titel: ${a.title}\nIngress: ${a.excerpt ?? ""}\nInnehåll: ${text}`;
      })
      .join("\n\n---\n\n");

    const systemPrompt = `Du är PowerBike-assistenten, en hjälpsam AI på motorcykelsajten powerbike.nu. Svara ALLTID på svenska. Använd följande artiklar som kontext:\n\n${articleContext}\n\nOm frågan inte rör motorcyklar eller sajten, svara ändå vänligt.`;

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });

    const messages = [
      ...(Array.isArray(history) ? history : []),
      { role: "user" as const, content: message },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ response: text });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json({ response: "Något gick fel. Försök igen." });
  }
}
