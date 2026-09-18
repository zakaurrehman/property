import "dotenv/config";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Create (or promote) a single admin account without touching anything else.
 *
 * `pnpm db:seed` wipes the database and fills it with demo content, which is
 * right for local development and wrong for production. A fresh production
 * database needs exactly one row before the admin panel is usable — the first
 * admin — and this is the only thing that creates it.
 *
 *   pnpm db:create-admin --email you@example.com --password "long passphrase" [--name "Your Name"]
 *
 * Point it at production by setting DATABASE_URL in the shell first (the
 * value from Vercel → Settings → Environment Variables); a shell variable
 * always wins over .env. If the email already exists the account is promoted
 * to ADMIN and its password replaced, so this also serves as a password reset.
 */

const argsSchema = z.object({
  email: z.string().email("--email must be a valid email address"),
  password: z.string().min(8, "--password must be at least 8 characters"),
  name: z.string().min(1).default("Administrator"),
});

function parseArgs(argv: string[]) {
  const raw: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const eq = arg.indexOf("=");
    if (eq !== -1) {
      raw[arg.slice(2, eq)] = arg.slice(eq + 1);
    } else {
      raw[arg.slice(2)] = argv[i + 1] ?? "";
      i++;
    }
  }
  // Env vars as a fallback so the command works from a CI/CD step too.
  raw.email ??= process.env.ADMIN_EMAIL ?? "";
  raw.password ??= process.env.ADMIN_PASSWORD ?? "";
  if (!raw.name && process.env.ADMIN_NAME) raw.name = process.env.ADMIN_NAME;
  return argsSchema.safeParse(raw);
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — export it or add it to .env");
  }
  const parsed = parseArgs(process.argv.slice(2));
  if (!parsed.success) {
    console.error(
      "Usage: pnpm db:create-admin --email <email> --password <password> [--name <name>]",
    );
    for (const issue of parsed.error.issues) console.error(`  ${issue.message}`);
    process.exit(1);
  }
  const { email, password, name } = parsed.data;

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 });
  const db = new PrismaClient({ adapter });
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    const user = await db.user.upsert({
      where: { email },
      create: { email, name, role: "ADMIN", passwordHash, emailVerified: new Date() },
      update: { role: "ADMIN", passwordHash },
      select: { email: true, role: true },
    });
    console.log(
      existing
        ? `Updated ${user.email}: role set to ${user.role}, password replaced.`
        : `Created ${user.email} with role ${user.role}.`,
    );
    console.log("Sign in at /login — this lands on /admin.");
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
