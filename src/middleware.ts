import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const sessionCookieName = "ginecologia_session";

export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(sessionCookieName)?.value);
  if (request.nextUrl.pathname === "/login") return hasSession ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/ui-kit")) return NextResponse.next();
  if (!hasSession) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon).*)"] };