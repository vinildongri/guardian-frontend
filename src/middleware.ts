import { NextResponse, type NextRequest } from "next/server";

// Pages other than /login and /register need the session cookie set by the backend.
export function middleware(req: NextRequest) {
  if (!req.cookies.has("token")) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!login|register|_next|favicon.ico).*)"] };
