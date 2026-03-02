import { Route } from "@prisma/client";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const allowedRoutes = (token?.allowedRoutes as Route["path"][]) ?? [];

    if (!token) {
      return NextResponse.redirect(
        new URL(`${process.env.NEXT_PUBLIC_HOST}/login`, req.url)
      );
    }

    if (!allowedRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(
        new URL(`${process.env.NEXT_PUBLIC_HOST}/not-found`, req.url)
      );
    }
  },
  {
    callbacks: { authorized: () => true },
  }
);

export const config = {
  matcher: [
    "/home/:path*",
    "/counters/:path*",
    "/queuing/:path*",
    "/reports/:path*",
    "/screensavers/:path*",
    "/transactions/:path*",
    "/system-logs/:path*",
    "/personnel/:path*",
    "/users/:path*",
    "/user-session/:path",

    "/api/auth/:path*",
  ],
};
