import "server-only";
import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "@/i18n/navigation";

/** Redirects to /login if unauthenticated. Use in Server Components/Actions that need any signed-in user. */
export async function requireUser() {
  const session = await auth();
  if (!session || !session.user) {
    redirect({ href: "/login", locale: await getLocale() });
    throw new Error("unreachable — redirect() always throws");
  }
  return session.user;
}

/** Redirects non-agent, non-admin users away. Returns the caller's Agent row so dashboard queries can scope by agentId. */
export async function requireAgent() {
  const user = await requireUser();
  const locale = await getLocale();
  if (user.role !== "AGENT" && user.role !== "ADMIN") {
    redirect({ href: "/", locale });
  }

  const agent = await db.agent.findUnique({ where: { userId: user.id } });
  if (!agent && user.role !== "ADMIN") {
    redirect({ href: "/", locale });
  }

  return { user, agent };
}

/** Redirects non-admin users away. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    redirect({ href: "/", locale: await getLocale() });
  }
  return user;
}
