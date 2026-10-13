import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");
  const adapter = new PrismaPg({
    connectionString,
    connectionTimeoutMillis: 5000,
    options: "-c timezone=UTC",
  });
  const prisma = new PrismaClient({ adapter });
  globalForPrisma.prisma = prisma;
  return prisma;
}
