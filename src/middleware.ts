import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;

    // Protect /admin routes
    if (pathname.startsWith("/admin")) {
      if (pathname === "/admin/login") {
        if (token?.role === "admin") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
        return NextResponse.next();
      }

      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    // Protect /user/dashboard routes
    if (pathname.startsWith("/user/dashboard")) {
      if (!token) {
        return NextResponse.redirect(new URL("/user/login", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // Let the middleware function handle the logic
    }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/user/dashboard/:path*"]
};
