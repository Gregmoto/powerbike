import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET!);

export async function GET(req: NextRequest) {
  const token = req.cookies.get("reader_token")?.value;
  if (!token) return NextResponse.json(null);
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return NextResponse.json({ id: payload.id, name: payload.name, email: payload.email });
  } catch {
    return NextResponse.json(null);
  }
}
