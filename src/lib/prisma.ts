import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Enhanced Prisma client with better error handling and logging
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });

// Graceful shutdown handling
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Handle connection errors gracefully
prisma.$connect().catch((error) => {
  console.error("Failed to connect to database:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});
