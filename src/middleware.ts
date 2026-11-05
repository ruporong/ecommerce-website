import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'd3d3ZWNvbWJ1aWxkYml6';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. Attempt to decode token with standard settings
  let token = await getToken({ req, secret: AUTH_SECRET });

  // 2. If token is not detected, try with explicit secureCookie true (HTTPS/production)
  if (!token) {
    token = await getToken({ req, secret: AUTH_SECRET, secureCookie: true });
  }

  // 3. Fallback to insecure cookie name if needed
  if (!token) {
    token = await getToken({ req, secret: AUTH_SECRET, secureCookie: false });
  }

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (token && token.role === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    if (!token || token.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // Protect /user/dashboard routes
  if (pathname.startsWith("/user/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/user/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/dashboard/:path*"]
};
