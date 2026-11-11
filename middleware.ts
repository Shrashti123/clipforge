import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Only the landing page and auth pages are public.
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware((auth, req) => {
  const { userId } = auth();

  // Signed-in users don't need the landing/auth pages.
  if (userId && isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  if (!userId && !isPublicRoute(req)) {
    // APIs answer with a proper 401 instead of redirecting to an HTML page.
    if (isApiRoute(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
