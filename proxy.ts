import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/auth") && isLoggedIn) {
        return NextResponse.redirect(new URL("/home", req.url));
    }

    if (pathname.startsWith("/home") && !isLoggedIn) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/home/:path*", "/auth/:path*"],
};