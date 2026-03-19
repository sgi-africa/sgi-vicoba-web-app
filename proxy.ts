import { auth } from "@/auth";
import { canAccessWeb } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Allow access to 403 page (no redirects)
  if (pathname === "/403") {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (pathname.startsWith("/auth") && isLoggedIn) {
    // Check access before redirecting to /home
    const user = req.auth?.user;
    if (!canAccessWeb(user)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // Protect /home routes
  if (pathname.startsWith("/home")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    const user = req.auth?.user;
    if (!canAccessWeb(user)) {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/home/:path*", "/auth/:path*", "/403"],
};
