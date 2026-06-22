import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { recordPageView } from "@/lib/db";

const VISITOR_COOKIE = "jf_vid";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const visitorId = request.cookies.get(VISITOR_COOKIE)?.value ?? randomUUID();

  event.waitUntil(
    recordPageView({
      path: request.nextUrl.pathname,
      visitorId,
      referrer: request.headers.get("referer"),
    }).catch(() => {})
  );

  const response = NextResponse.next();
  if (!request.cookies.get(VISITOR_COOKIE)) {
    response.cookies.set(VISITOR_COOKIE, visitorId, {
      maxAge: VISITOR_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|admin|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
