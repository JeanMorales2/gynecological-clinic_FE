import { NextResponse } from "next/server";

const sessionCookieName = "ginecologia_session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, "", { httpOnly: true, sameSite: "lax", expires: new Date(0), path: "/" });
  return response;
}