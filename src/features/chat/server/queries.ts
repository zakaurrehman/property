import "server-only";
import { db } from "@/lib/db";

export interface AdvisorAgent {
  name: string;
  photo: string;
  whatsapp: string;
}

/**
 * The agent "face" of the advisor widget — any featured agent, falling back
 * gracefully. This runs from the root layout on every page, so a DB hiccup
 * here must never take down the whole render: the widget already handles
 * `null` (generic label, default WhatsApp number), so any failure — no
 * featured agent, a dropped connection, whatever — just means the generic
 * fallback shows instead of a crash.
 */
export async function getAdvisorAgent(): Promise<AdvisorAgent | null> {
  try {
    const agent = await db.agent.findFirst({
      where: { isFeatured: true },
      orderBy: { rating: "desc" },
      select: { photo: true, whatsapp: true, user: { select: { name: true } } },
    });
    if (!agent) return null;
    return { name: agent.user.name, photo: agent.photo, whatsapp: agent.whatsapp };
  } catch (error) {
    console.error(
      "[advisor-agent] lookup failed, falling back to generic widget:",
      error,
    );
    return null;
  }
}
