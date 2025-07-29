// Test the settings API logic directly without server
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simulate GET API
async function testGetAPI() {
  try {
    console.log("🔍 Testing GET API logic...");

    // Fetch all settings from the key-value table
    const allSettings = await prisma.siteSetting.findMany();

    // Convert to object format expected by frontend
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

    const response = {
      success: true,
      settings: settingsObject,
    };

    console.log("✅ GET API logic successful");
    console.log(`📊 Found ${Object.keys(settingsObject).length} settings`);

    // Test specific settings that frontend expects
    const expectedKeys = [
      "site.name",
      "site.description",
      "site.timezone",
      "site.language",
      "site.maintenanceMode",
      "site.logo",
      "site.favicon",
      "about.vision",
      "about.mission",
      "contact.address",
      "contact.phone",
      "contact.email",
    ];

    console.log("\n🔍 Checking expected settings...");
    expectedKeys.forEach((key) => {
      if (settingsObject[key]) {
        console.log(`✅ ${key}: ${settingsObject[key].value}`);
      } else {
        console.log(`❌ Missing: ${key}`);
      }
    });

    return response;
  } catch (error) {
    console.error("❌ GET API test failed:", error);
    return {
      success: false,
      message: "Failed to fetch settings",
      error: String(error),
    };
  }
}

// Simulate POST API
async function testPostAPI() {
  try {
    console.log("\n📝 Testing POST API logic...");

    const testData = {
      key: "test.setting",
      value: "test value updated",
      type: "STRING",
      category: "TEST",
      label: "Test Setting",
      description: "A test setting for API testing",
      isPublic: true,
    };

    // Validate required fields
    if (!testData.key || testData.value === undefined) {
      throw new Error("Key and value are required");
    }

    // Update or create setting
    const setting = await prisma.siteSetting.upsert({
      where: { key: testData.key },
      update: {
        value: String(testData.value),
        type: testData.type || "STRING",
        category: testData.category || "GENERAL",
        label: testData.label || testData.key,
        description: testData.description || "",
        isPublic: testData.isPublic !== undefined ? testData.isPublic : true,
      },
      create: {
        key: testData.key,
        value: String(testData.value),
        type: testData.type || "STRING",
        category: testData.category || "GENERAL",
        label: testData.label || testData.key,
        description: testData.description || "",
        isPublic: testData.isPublic !== undefined ? testData.isPublic : true,
      },
    });

    console.log("✅ POST API logic successful");
    console.log("📝 Setting saved:", setting);

    return {
      success: true,
      data: setting,
      message: "Setting updated successfully",
    };
  } catch (error) {
    console.error("❌ POST API test failed:", error);
    return {
      success: false,
      message: "Failed to update setting",
      error: String(error),
    };
  }
}

// Test frontend data transformation
async function testFrontendTransformation() {
  try {
    console.log("\n🔄 Testing frontend data transformation...");

    const apiResponse = await testGetAPI();

    if (!apiResponse.success) {
      throw new Error("Failed to get settings");
    }

    const settings = apiResponse.settings;

    // Transform to frontend format (like in the settings page)
    const frontendSettings = {
      system: {
        siteName: settings["site.name"]?.value || "TPQ Baitus Shuffah",
        siteDescription:
          settings["site.description"]?.value ||
          "Lembaga Pendidikan Tahfidz Al-Quran",
        timezone: settings["site.timezone"]?.value || "Asia/Jakarta",
        language: settings["site.language"]?.value || "id",
        maintenanceMode: settings["site.maintenanceMode"]?.value === "true",
        logo: settings["site.logo"]?.value || "/logo.png",
        favicon: settings["site.favicon"]?.value || "/favicon.ico",
      },
      about: {
        vision: settings["about.vision"]?.value || "",
        mission: settings["about.mission"]?.value || "",
        history: settings["about.history"]?.value || "",
        values: settings["about.values"]?.value || "",
        achievements: settings["about.achievements"]?.value || "",
      },
      contact: {
        address: settings["contact.address"]?.value || "",
        phone: settings["contact.phone"]?.value || "",
        email: settings["contact.email"]?.value || "",
        whatsapp: settings["contact.whatsapp"]?.value || "",
        operationalHours: settings["contact.operationalHours"]?.value || "",
      },
      integrations: {
        whatsappToken: settings["integration.whatsapp.token"]?.value || "",
        emailHost: settings["integration.email.host"]?.value || "",
        emailPort: settings["integration.email.port"]?.value || "",
        emailUsername: settings["integration.email.username"]?.value || "",
        emailPassword: settings["integration.email.password"]?.value || "",
        paymentGateway: settings["integration.payment.gateway"]?.value || "",
      },
    };

    console.log("✅ Frontend transformation successful");
    console.log("📋 Frontend settings structure:");
    console.log(JSON.stringify(frontendSettings, null, 2));

    return frontendSettings;
  } catch (error) {
    console.error("❌ Frontend transformation failed:", error);
  }
}

async function runAllTests() {
  console.log("🧪 Testing Settings API Logic...\n");

  await testGetAPI();
  await testPostAPI();
  await testFrontendTransformation();

  console.log("\n🏁 All API tests completed!");

  await prisma.$disconnect();
}

runAllTests();
