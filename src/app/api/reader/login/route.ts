import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const reader = await prisma.reader.findUnique({ where: { email: email?.toLowerCase() } });
  if (!reader || !(await bcrypt.compare(password, reader.passwordHash))) {
    return NextResponse.json({ error: "Fel e-post eller lösenord." }, { status: 401 });
  }

  const token = await new SignJWT({ id: reader.id, name: reader.name, email: reader.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);

  const res = NextResponse.json({ name: reader.name, email: reader.email });
  res.cookies.set("reader_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("reader_token", "", { maxAge: 0, path: "/" });
  return res;
}
