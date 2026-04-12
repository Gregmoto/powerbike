import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name?.trim() || !email?.includes("@") || !password || password.length < 6) {
    return NextResponse.json({ error: "Fyll i alla fält. Lösenord minst 6 tecken." }, { status: 400 });
  }

  const existing = await prisma.reader.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-postadressen är redan registrerad." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const reader = await prisma.reader.create({
    data: { name: name.trim(), email: email.trim().toLowerCase(), passwordHash },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json(reader);
}
