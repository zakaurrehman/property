import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
  // Keep this small: each serverless function instance (and each `next build`
  // static-generation worker) gets its own pool, so an unbounded default
  // (pg's default max is 10) multiplies across processes and can exceed the
  // database's total connection limit — especially the local `prisma dev`
  // server, which caps at 10 connections total.
  max: 5,
});

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
