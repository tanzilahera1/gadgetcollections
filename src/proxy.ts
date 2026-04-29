import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;
  const { pathname } = nextUrl;

  const res = NextResponse.next();

  // 1. Guest cart_session_id - সব পেজে সেট হবে যদি লগিন না থাকে
  if (!req.cookies.get("cart_session_id") && !isLoggedIn) {
    res.cookies.set("cart_session_id", uuidv4(), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 দিন
      sameSite: "lax",
      path: "/",
    });
  }

  // 2. /dashboard - লগিন লাগবে
  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const callbackUrl = pathname + nextUrl.search;
      return NextResponse.redirect(
        new URL(
          `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
          nextUrl,
        ),
      );
    }
    return res;
  }

  // 3. /admin - লগিন + admin রোল লাগবে
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "admin") {
      return NextResponse.redirect(new URL("/not-allowed", nextUrl));
    }
    return res;
  }

  return res;
});

// সব রুটে রান হবে static/api বাদে, যাতে cart_session_id সবখানে সেট হয়
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
