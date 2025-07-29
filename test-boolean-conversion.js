// Test boolean conversion for settings
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testBooleanConversion() {
  try {
    console.log("🔍 Testing boolean conversion...");

    // Get the maintenance mode setting
    const maintenanceSetting = await prisma.siteSetting.findUnique({
      where: { key: "site.maintenanceMode" },
    });

    if (maintenanceSetting) {
      console.log("📊 Current maintenance mode setting:");
      console.log(
        `  - Value: "${maintenanceSetting.value}" (type: ${typeof maintenanceSetting.value})`,
      );
      console.log(`  - Type: ${maintenanceSetting.type}`);

      // Test different conversion methods
      console.log("\n🔄 Testing conversion methods:");
      console.log(`  - Boolean(value): ${Boolean(maintenanceSetting.value)}`);
      console.log(
        `  - value === "true": ${maintenanceSetting.value === "true"}`,
      );
      console.log(`  - value === true: ${maintenanceSetting.value === true}`);
      console.log(
        `  - Combined: ${maintenanceSetting.value === "true" || maintenanceSetting.value === true}`,
      );

      // Test what happens with different values
      const testValues = ["true", "false", true, false, "1", "0", 1, 0];
      console.log("\n🧪 Testing different values:");
      testValues.forEach((val) => {
        const converted = val === "true" || val === true;
        console.log(`  - "${val}" (${typeof val}) -> ${converted}`);
      });
    } else {
      console.log("❌ Maintenance mode setting not found");
    }

    // Test updating with boolean value
    console.log("\n📝 Testing update with boolean...");
    await prisma.siteSetting.update({
      where: { key: "site.maintenanceMode" },
      data: { value: "false" }, // Ensure it's stored as string
    });

    console.log("✅ Updated maintenance mode to false");

    // Verify the update
    const updatedSetting = await prisma.siteSetting.findUnique({
      where: { key: "site.maintenanceMode" },
    });

    console.log(
      `📊 After update: "${updatedSetting?.value}" -> ${updatedSetting?.value === "true" || updatedSetting?.value === true}`,
    );
  } catch (error) {
    console.error("❌ Error testing boolean conversion:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Test the frontend transformation
async function testFrontendTransformation() {
  try {
    console.log("\n🔄 Testing frontend transformation...");

    const allSettings = await prisma.siteSetting.findMany();
    const settingsObject = {};

    allSettings.forEach((setting) => {
      settingsObject[setting.key] = {
        value: setting.value,
        type: setting.type,
        category: setting.category,
        label: setting.label,
        description: setting.description,
        isPublic: setting.isPublic,
      };
    });

    // Simulate frontend transformation
    const frontendSettings = {
      system: {
        siteName: settingsObject["site.name"]?.value || "TPQ Baitus Shuffah",
        siteDescription:
          settingsObject["site.description"]?.value ||
          "Lembaga Pendidikan Tahfidz Al-Quran",
        timezone: settingsObject["site.timezone"]?.value || "Asia/Jakarta",
        language: settingsObject["site.language"]?.value || "id",
        maintenanceMode:
          settingsObject["site.maintenanceMode"]?.value === "true" ||
          settingsObject["site.maintenanceMode"]?.value === true,
        logo: settingsObject["site.logo"]?.value || "/logo.png",
        favicon: settingsObject["site.favicon"]?.value || "/favicon.ico",
      },
    };

    console.log("📋 Frontend settings:");
    console.log(
      `  - maintenanceMode: ${frontendSettings.system.maintenanceMode} (type: ${typeof frontendSettings.system.maintenanceMode})`,
    );
    console.log(`  - siteName: ${frontendSettings.system.siteName}`);

    // Test checkbox value
    const checkboxValue = Boolean(frontendSettings.system.maintenanceMode);
    console.log(
      `  - Boolean(maintenanceMode): ${checkboxValue} (type: ${typeof checkboxValue})`,
    );

    console.log("✅ Frontend transformation successful");
  } catch (error) {
    console.error("❌ Error testing frontend transformation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function runTests() {
  console.log("🧪 Testing Boolean Conversion for Settings...\n");

  await testBooleanConversion();
  await testFrontendTransformation();

  console.log("\n🏁 Boolean conversion tests completed!");
}

runTests();
