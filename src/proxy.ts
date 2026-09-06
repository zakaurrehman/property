import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

/** Route prefixes after stripping any locale prefix. */
const AGENT_OR_ADMIN_PREFIX = "/dashboard";
const ADMIN_ONLY_PREFIX = "/admin";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // "as-needed" locale prefixing means only non-default locales (ur) show up
  // in the path — strip that off before matching route prefixes below.
  const localeMatch = pathname.match(/^\/(ur)(?=\/|$)/);
  const localePrefix = localeMatch ? localeMatch[0] : "";
  const path = localeMatch ? pathname.slice(localeMatch[0].length) || "/" : pathname;

  const needsAuth =
    path.startsWith(AGENT_OR_ADMIN_PREFIX) || path.startsWith(ADMIN_ONLY_PREFIX);

  if (needsAuth && !req.auth?.user) {
    const signInUrl = new URL(`${localePrefix}/login`, req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (path.startsWith(ADMIN_ONLY_PREFIX) && req.auth?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL(`${localePrefix}/`, req.nextUrl));
  }

  if (path.startsWith(AGENT_OR_ADMIN_PREFIX)) {
    const role = req.auth?.user.role;
    if (role !== "AGENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL(`${localePrefix}/`, req.nextUrl));
    }
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
  ],
};
