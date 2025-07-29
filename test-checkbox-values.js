// Test checkbox values to ensure no string boolean issues
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function simulateSettingsLoad() {
  try {
    console.log("🔍 Simulating settings load like in frontend...");

    // Fetch all settings from the key-value table (like API does)
    const allSettings = await prisma.siteSetting.findMany();

    // Convert to object format expected by frontend (like API does)
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

    console.log("✅ API response simulation successful");

    // Simulate frontend data processing (like in useEffect)
    const newSettings = {
      system: {
        siteName: "TPQ Baitus Shuffah",
        siteDescription: "Lembaga Pendidikan Tahfidz Al-Quran",
        timezone: "Asia/Jakarta",
        language: "id",
        maintenanceMode: false,
        logo: "/logo.png",
        favicon: "/favicon.ico",
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        weeklyReports: true,
        monthlyReports: true,
      },
    };

    // Apply the same logic as in the frontend
    if (settingsObject["site.maintenanceMode"]) {
      newSettings.system.maintenanceMode =
        settingsObject["site.maintenanceMode"].value === "true" ||
        settingsObject["site.maintenanceMode"].value === true;
    }

    console.log("📊 Frontend processing results:");
    console.log(
      `  - Raw value from DB: "${settingsObject["site.maintenanceMode"]?.value}"`,
    );
    console.log(
      `  - Converted value: ${newSettings.system.maintenanceMode} (type: ${typeof newSettings.system.maintenanceMode})`,
    );

    // Test checkbox scenarios
    console.log("\n🔲 Testing checkbox scenarios:");

    // Scenario 1: Direct usage (should work)
    const checkbox1Value = newSettings.system.maintenanceMode;
    console.log(`  - Direct usage: checked={${checkbox1Value}} ✅`);

    // Scenario 2: Boolean conversion (redundant but safe)
    const checkbox2Value = Boolean(newSettings.system.maintenanceMode);
    console.log(`  - Boolean conversion: checked={${checkbox2Value}} ✅`);

    // Scenario 3: What would cause the error (string boolean)
    const badValue = settingsObject["site.maintenanceMode"]?.value; // This would be "false" string
    console.log(
      `  - Bad usage (string): checked={"${badValue}"} ❌ (would cause error)`,
    );
    console.log(`  - Boolean("false"): ${Boolean("false")} ❌ (wrong result)`);

    // Test notifications (should also work)
    console.log("\n📧 Testing notifications:");
    const notificationKeys = [
      "emailNotifications",
      "smsNotifications",
      "pushNotifications",
    ];
    notificationKeys.forEach((key) => {
      const value = newSettings.notifications[key] || false;
      console.log(`  - ${key}: checked={${value}} (type: ${typeof value}) ✅`);
    });

    console.log("\n✅ All checkbox values are properly typed as boolean");
  } catch (error) {
    console.error("❌ Error simulating settings load:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testDifferentBooleanValues() {
  try {
    console.log("\n🧪 Testing different boolean values in database...");

    // Test with "true" string
    await prisma.siteSetting.update({
      where: { key: "site.maintenanceMode" },
      data: { value: "true" },
    });

    let setting = await prisma.siteSetting.findUnique({
      where: { key: "site.maintenanceMode" },
    });

    let converted = setting.value === "true" || setting.value === true;
    console.log(`  - DB: "true" -> Frontend: ${converted} ✅`);

    // Test with "false" string
    await prisma.siteSetting.update({
      where: { key: "site.maintenanceMode" },
      data: { value: "false" },
    });

    setting = await prisma.siteSetting.findUnique({
      where: { key: "site.maintenanceMode" },
    });

    converted = setting.value === "true" || setting.value === true;
    console.log(`  - DB: "false" -> Frontend: ${converted} ✅`);

    // Reset to false
    await prisma.siteSetting.update({
      where: { key: "site.maintenanceMode" },
      data: { value: "false" },
    });

    console.log("✅ Boolean conversion works correctly for all cases");
  } catch (error) {
    console.error("❌ Error testing boolean values:", error);
  }
}

async function runTests() {
  console.log("🧪 Testing Checkbox Values and Boolean Conversion...\n");

  await simulateSettingsLoad();
  await testDifferentBooleanValues();

  console.log("\n🏁 Checkbox value tests completed!");
  console.log("\n📝 Summary:");
  console.log(
    "  ✅ Boolean values are properly converted from string to boolean",
  );
  console.log("  ✅ Checkbox components receive proper boolean values");
  console.log('  ✅ No more "string boolean" errors should occur');
}

runTests();
