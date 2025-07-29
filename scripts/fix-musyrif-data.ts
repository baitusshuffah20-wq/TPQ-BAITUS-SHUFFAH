import { prisma } from "../src/lib/prisma";
import fs from "fs";

async function fixMusyrifData() {
  // First create backup
  console.log("Creating backup of current musyrif data...");
  const backup = await prisma.musyrif.findMany();
  fs.writeFileSync("backup_musyrif.json", JSON.stringify(backup, null, 2));
  console.log("Backup created at backup_musyrif.json");

  // Get all musyrif with problematic data
  console.log("Finding musyrif with invalid JSON data...");
  const musyrifs = await prisma.musyrif.findMany({
    where: {
      OR: [
        { educationData: { not: null } },
        { experienceData: { not: null } },
        { certificatesData: { not: null } },
      ],
    },
  });

  console.log(`Found ${musyrifs.length} musyrif to check`);
  let fixedCount = 0;

  for (const musyrif of musyrifs) {
    try {
      const updates: Record<string, unknown> = {};
      let needsUpdate = false;

      // Fix educationData
      if (musyrif.educationData) {
        try {
          JSON.parse(musyrif.educationData);
        } catch {
          needsUpdate = true;
          const fixed = tryFixJson(musyrif.educationData);
          updates.educationData = fixed ? JSON.stringify(fixed) : null;
        }
      }

      // Fix experienceData
      if (musyrif.experienceData) {
        try {
          JSON.parse(musyrif.experienceData);
        } catch {
          needsUpdate = true;
          const fixed = tryFixJson(musyrif.experienceData);
          updates.experienceData = fixed ? JSON.stringify(fixed) : null;
        }
      }

      // Fix certificatesData
      if (musyrif.certificatesData) {
        try {
          JSON.parse(musyrif.certificatesData);
        } catch {
          needsUpdate = true;
          const fixed = tryFixJson(musyrif.certificatesData);
          updates.certificatesData = fixed ? JSON.stringify(fixed) : null;
        }
      }

      if (needsUpdate) {
        await prisma.musyrif.update({
          where: { id: musyrif.id },
          data: updates,
        });
        fixedCount++;
        console.log(`Fixed data for musyrif ${musyrif.id}`);
      }
    } catch (error) {
      console.error(`Error fixing musyrif ${musyrif.id}:`, error);
    }
  }

  console.log(`Done. Fixed ${fixedCount} musyrif records`);
  process.exit(0);
}

function tryFixJson(badJson: string) {
  if (!badJson) return null;

  // Basic cleanup
  let cleaned = badJson.trim();
  if (!cleaned.startsWith("[")) cleaned = cleaned.replace(/^[^[]*/, "");
  if (!cleaned.endsWith("]")) cleaned = cleaned.replace(/[^\]]*$/, "");

  try {
    return JSON.parse(cleaned);
  } catch {
    console.warn("Could not fix JSON:", badJson);
    return null;
  }
}

fixMusyrifData().catch((error) => {
  console.error("Error in fixMusyrifData:", error);
  process.exit(1);
});
