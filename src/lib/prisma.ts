import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL is properly configured
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL environment variable is not set!");
  console.error("Please set DATABASE_URL in your environment variables.");
  console.error("For Vercel deployment, set it in Vercel Dashboard > Settings > Environment Variables");

  if (process.env.NODE_ENV === "production") {
    console.error("🚨 CRITICAL: DATABASE_URL is required in production!");
    console.error("Set DATABASE_URL in Vercel Environment Variables:");
    console.error("DATABASE_URL=mysql://username:password@host:port/database");
    throw new Error("DATABASE_URL is required in production");
  }
}

console.log("🔗 Database URL configured:", databaseUrl ? "✅ Yes" : "❌ No");

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
