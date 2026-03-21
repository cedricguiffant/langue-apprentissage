import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED  = ["/dashboard", "/learn", "/profile"];
const AUTH_ONLY  = ["/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip when Firebase is not yet configured
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    return NextResponse.next();
  }

  // Presence-only check — full token verification happens in server components
  const session = request.cookies.get("__session")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly  = AUTH_ONLY.some((p)  => pathname.startsWith(p));

  if (isProtected && !session) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
  if (isAuthOnly && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
