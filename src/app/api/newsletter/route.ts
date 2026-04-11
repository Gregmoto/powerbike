import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Ogiltig e-postadress" }, { status: 400 });
  }

  const existing = await prisma.subscriber.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: "Du är redan prenumerant!" });
  }

  await prisma.subscriber.create({ data: { email } });

  // Välkomstmail via Resend
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Välkommen till Powerbike!",
    html: `
      <h2>Välkommen till Powerbike!</h2>
      <p>Du prenumererar nu på nyheter från Powerbike — inspiration inom MC-världen.</p>
      <p>Vi hör av oss när det händer något spännande!</p>
      <hr/>
      <p style="color:#888;font-size:12px">Du kan avprenumerera när som helst.</p>
    `,
  });

  return NextResponse.json({ message: "Tack! Du är nu prenumerant." });
}
