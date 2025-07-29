import mysql from "mysql2/promise";

async function testSettingsDatabase() {
  let connection;

  try {
    console.log("🔌 Connecting to database...");

    // Create connection
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "admin123",
      database: "db_tpq",
    });

    console.log("✅ Connected to database");

    // Test if site_setting table exists
    console.log("\n📋 Checking site_setting table...");
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'site_setting'",
    );

    if (tables.length > 0) {
      console.log("✅ site_setting table exists");

      // Get all settings
      console.log("\n📊 Fetching all settings...");
      const [settings] = await connection.execute("SELECT * FROM site_setting");

      console.log(`✅ Found ${settings.length} settings:`);
      settings.forEach((setting) => {
        console.log(
          `  - ${setting.key}: ${setting.value} (${setting.category})`,
        );
      });

      // Test the structure expected by frontend
      console.log("\n🔄 Converting to frontend format...");
      const settingsObject = {};
      settings.forEach((setting) => {
        settingsObject[setting.key] = {
          value: setting.value,
          type: setting.type,
          category: setting.category,
          label: setting.label,
          description: setting.description,
          isPublic: setting.isPublic,
        };
      });

      console.log("✅ Frontend format conversion successful");
      console.log("Sample settings object:");
      console.log(JSON.stringify(settingsObject, null, 2));
    } else {
      console.log("❌ site_setting table does not exist");
    }
  } catch (error) {
    console.error("❌ Database test failed:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n🔌 Database connection closed");
    }
  }
}

// Test Prisma connection
async function testPrismaConnection() {
  try {
    console.log("\n🔧 Testing Prisma connection...");

    // Import Prisma client
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    console.log("✅ Prisma client created");

    // Test connection
    const settings = await prisma.siteSetting.findMany();
    console.log(
      `✅ Prisma query successful: Found ${settings.length} settings`,
    );

    // Test the API logic
    const settingsObject = {};
    settings.forEach((setting) => {
      settingsObject[setting.key] = {
        value: setting.value,
        type: setting.type,
        category: setting.category,
        label: setting.label,
        description: setting.description,
        isPublic: setting.isPublic,
      };
    });

    console.log("✅ API logic test successful");

    await prisma.$disconnect();
    console.log("✅ Prisma disconnected");
  } catch (error) {
    console.error("❌ Prisma test failed:", error);
  }
}

async function runAllTests() {
  console.log("🧪 Testing Settings System...\n");

  await testSettingsDatabase();
  await testPrismaConnection();

  console.log("\n🏁 All tests completed!");
}

runAllTests();
