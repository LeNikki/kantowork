import { NextResponse, type NextRequest } from "next/server";
import { readUserCookie, USER_COOKIE } from "@/lib/session";

const TOKEN_KEY = "kantowork.token";

// Public routes render for signed-out visitors; everything else needs a session.
// Signed-out visitors must reach the password reset pages as well, or a user
// locked out of their account has no way back in. The reset-password route is
// public because it is opened straight from the emailed link.
const PUBLIC_ROUTES = [
  "/login",
  "/signup",
  "/forgotpassword",
  "/reset-password",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_KEY)?.value;
  const user = request.cookies.get(USER_COOKIE)?.value;
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  // Signed in means a token AND a user cookie this module can actually parse -
  // the same test app/page.tsx makes before it renders. Checking mere presence
  // here let a corrupt cookie past the proxy while the page bounced to /login,
  // so the two guards disagreed and the browser looped.
  const signedIn = Boolean(token) && readUserCookie(user) !== null;

  // Signed in on an auth screen, or signed out on a protected page.
  const response =
    signedIn === isPublic
      ? NextResponse.redirect(new URL(signedIn ? "/" : "/login", request.url))
      : NextResponse.next();

  // Drop whichever cookie was orphaned so the browser stops sending a session
  // that can never render. Applied to the redirect too - that is the common
  // case, since a stale token is what sent us to /login in the first place.
  if (!signedIn) {
    if (token) response.cookies.delete(TOKEN_KEY);
    if (user) response.cookies.delete(USER_COOKIE);
  }

  return response;
}

export const config = {
  // Everything except API calls, Next internals and static assets. Without the
  // negative match this would also fire for CSS, JS and images and break them.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};