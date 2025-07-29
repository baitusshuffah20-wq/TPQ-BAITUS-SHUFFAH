// Script to apply the halaqah migration safely
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Applying halaqah migration...");

try {
  // Run the migration using Prisma
  console.log("Running migration with Prisma...");
  execSync(
    "npx prisma db execute --file ./prisma/migrations/add_type_to_halaqah_safe.sql",
    {
      stdio: "inherit",
    },
  );

  console.log("Migration applied successfully!");
} catch (error) {
  console.error("Error applying migration:", error.message);

  // If Prisma fails, provide instructions for manual migration
  console.log(
    "\nIf the automatic migration failed, you can apply it manually:",
  );
  console.log("1. Open your MySQL client (e.g., phpMyAdmin)");
  console.log("2. Connect to your database");
  console.log("3. Run the following SQL:");
  console.log(
    "   ALTER TABLE halaqah ADD COLUMN type VARCHAR(191) NOT NULL DEFAULT 'QURAN';",
  );
  console.log("   (Only if the column doesn't already exist)");
}
