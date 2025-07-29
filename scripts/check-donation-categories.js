/**
 * Script to check donation categories in database
 * Checks both DonationCategory table and SiteSettings fallback
 */

import { prisma } from "../src/lib/prisma.ts";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  try {
    console.log("Checking donation categories in DonationCategory table:");
    const categories = await prisma.donationCategory.findMany();
    console.log(`Found ${categories.length} categories`);
    console.log(JSON.stringify(categories, null, 2));

    console.log("\nChecking donation_categories in SiteSettings:");
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "donation_categories" },
    });

    if (setting) {
      console.log("Found donation categories setting:");
      console.log(JSON.stringify(JSON.parse(setting.value), null, 2));
    } else {
      console.log("No donation_categories setting found!");
    }
  } catch (error) {
    console.error("Error checking donation categories:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
