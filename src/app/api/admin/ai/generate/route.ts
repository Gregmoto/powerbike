import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ content: "Sätt ANTHROPIC_API_KEY i Vercel-miljövariabler." });
  }

  const { title, category } = await req.json();
  if (!title) return NextResponse.json({ error: "Titel krävs" }, { status: 400 });

  try {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Skriv ett artikelutkast på svenska för en motorcykelsajt. Titeln är: "${title}". Kategorin är: "${category}". Skriv ca 500 ord i HTML med <p>, <h2> och <h3>-taggar. Inga markdown-tecken, bara HTML. Börja direkt med innehållet.`,
        },
      ],
    });

    const content = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ content });
  } catch (err) {
    console.error("AI generate error:", err);
    return NextResponse.json({ error: "AI-fel" }, { status: 500 });
  }
}
