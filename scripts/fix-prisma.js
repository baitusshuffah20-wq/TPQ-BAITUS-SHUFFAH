// @ts-check
/**
 * This script fixes common Prisma issues on Windows and tests database connectivity
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

/**
 * Execute a command and return its output
 * @param {string} command - Command to execute
 * @param {boolean} [silent=false] - Whether to suppress console output
 * @returns {string} Command output
 */
function exec(command, silent = false) {
  try {
    if (!silent) {
      console.log(`${colors.blue}> ${command}${colors.reset}`);
    }
    const output = execSync(command, { encoding: "utf8" });
    if (!silent && output.trim()) {
      console.log(output);
    }
    return output;
  } catch (error) {
    if (!silent) {
      console.error(
        `${colors.red}Error executing command: ${command}${colors.reset}`,
      );
      console.error(error.message);
    }
    return error.message;
  }
}

/**
 * Check if a file or directory exists
 * @param {string} path - Path to check
 * @returns {boolean} Whether the path exists
 */
function exists(path) {
  try {
    fs.accessSync(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the .env file exists and has the required variables
 * @returns {boolean} Whether the .env file is valid
 */
function checkEnvFile() {
  console.log(`\n${colors.cyan}Checking .env file...${colors.reset}`);

  if (!exists(".env")) {
    console.error(`${colors.red}Error: .env file not found!${colors.reset}`);
    console.log(
      `${colors.yellow}Creating .env file from .env.example...${colors.reset}`,
    );

    if (exists(".env.example")) {
      fs.copyFileSync(".env.example", ".env");
      console.log(
        `${colors.green}Created .env file from .env.example. Please update it with your database credentials.${colors.reset}`,
      );
    } else {
      console.error(
        `${colors.red}Error: .env.example file not found!${colors.reset}`,
      );
      return false;
    }
  }

  // Read .env file
  const envContent = fs.readFileSync(".env", "utf8");
  const envLines = envContent.split("\n");

  // Check for DATABASE_URL
  const databaseUrlLine = envLines.find((line) =>
    line.startsWith("DATABASE_URL="),
  );
  if (!databaseUrlLine) {
    console.error(
      `${colors.red}Error: DATABASE_URL not found in .env file!${colors.reset}`,
    );
    return false;
  }

  // Check if DATABASE_URL is properly configured (not using placeholder values)
  const databaseUrl = databaseUrlLine.split("=")[1].trim().replace(/["']/g, "");
  if (
    databaseUrl.includes("username:password") ||
    databaseUrl.includes("your-database-url")
  ) {
    console.error(
      `${colors.red}Error: DATABASE_URL in .env file contains placeholder values!${colors.reset}`,
    );
    return false;
  }

  console.log(`${colors.green}.env file looks good!${colors.reset}`);
  return true;
}

/**
 * Clean Prisma cache
 */
function cleanPrismaCache() {
  console.log(`\n${colors.cyan}Cleaning Prisma cache...${colors.reset}`);

  // Paths to clean
  const cachePaths = [
    "node_modules/.prisma",
    "node_modules/@prisma/client",
    ".next/cache",
  ];

  // Clean each path
  cachePaths.forEach((cachePath) => {
    if (exists(cachePath)) {
      console.log(`${colors.yellow}Removing ${cachePath}...${colors.reset}`);
      try {
        exec(`rmdir /s /q "${cachePath}"`, true);
      } catch (error) {
        console.error(
          `${colors.red}Error removing ${cachePath}: ${error.message}${colors.reset}`,
        );
      }
    }
  });

  console.log(`${colors.green}Prisma cache cleaned!${colors.reset}`);
}

/**
 * Reinstall Prisma dependencies
 */
function reinstallPrismaDependencies() {
  console.log(
    `\n${colors.cyan}Reinstalling Prisma dependencies...${colors.reset}`,
  );

  // Uninstall Prisma dependencies
  exec("npm uninstall @prisma/client prisma");

  // Install Prisma dependencies
  exec("npm install @prisma/client");
  exec("npm install prisma --save-dev");

  console.log(`${colors.green}Prisma dependencies reinstalled!${colors.reset}`);
}

/**
 * Generate Prisma client
 */
function generatePrismaClient() {
  console.log(`\n${colors.cyan}Generating Prisma client...${colors.reset}`);

  // Generate Prisma client
  const result = exec("npx prisma generate");

  // Check if generation was successful
  if (result.includes("Error")) {
    console.error(
      `${colors.red}Error generating Prisma client!${colors.reset}`,
    );
    return false;
  }

  console.log(
    `${colors.green}Prisma client generated successfully!${colors.reset}`,
  );
  return true;
}

/**
 * Test database connection
 */
function testDatabaseConnection() {
  console.log(`\n${colors.cyan}Testing database connection...${colors.reset}`);

  // Create a temporary file to test database connection
  const testFile = "prisma/test-connection.js";
  const testCode = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Test connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connection successful!');
    
    // Get database info
    const result = await prisma.$queryRaw\`SELECT VERSION() as version\`;
    console.log('Database version:', result[0].version);
    
    // Get table count
    const tables = await prisma.$queryRaw\`SHOW TABLES\`;
    console.log('Tables found:', tables.length);
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
`;

  fs.writeFileSync(testFile, testCode);

  // Run the test file
  try {
    exec(`node ${testFile}`);
    fs.unlinkSync(testFile);
    return true;
  } catch (error) {
    console.error(
      `${colors.red}Database connection test failed!${colors.reset}`,
    );
    fs.unlinkSync(testFile);
    return false;
  }
}

/**
 * Push schema to database
 */
function pushSchemaToDatabase() {
  console.log(`\n${colors.cyan}Pushing schema to database...${colors.reset}`);

  // Ask for confirmation
  rl.question(
    `${colors.yellow}This will update your database schema. Continue? (y/n) ${colors.reset}`,
    (answer) => {
      if (answer.toLowerCase() === "y") {
        // Push schema to database
        const result = exec("npx prisma db push");

        // Check if push was successful
        if (result.includes("Error")) {
          console.error(
            `${colors.red}Error pushing schema to database!${colors.reset}`,
          );
        } else {
          console.log(
            `${colors.green}Schema pushed to database successfully!${colors.reset}`,
          );
        }
      } else {
        console.log(`${colors.yellow}Schema push cancelled.${colors.reset}`);
      }

      rl.close();
    },
  );
}

/**
 * Main function
 */
async function main() {
  console.log(`${colors.magenta}=== Prisma Fix Script ===${colors.reset}`);
  console.log(
    `${colors.magenta}This script will fix common Prisma issues and test database connectivity${colors.reset}`,
  );

  // Check .env file
  const envValid = checkEnvFile();
  if (!envValid) {
    console.error(
      `${colors.red}Please fix your .env file and run this script again.${colors.reset}`,
    );
    process.exit(1);
  }

  // Clean Prisma cache
  cleanPrismaCache();

  // Reinstall Prisma dependencies
  reinstallPrismaDependencies();

  // Generate Prisma client
  const clientGenerated = generatePrismaClient();
  if (!clientGenerated) {
    console.error(
      `${colors.red}Please fix the Prisma client generation issues and run this script again.${colors.reset}`,
    );
    process.exit(1);
  }

  // Test database connection
  const connectionSuccessful = testDatabaseConnection();
  if (!connectionSuccessful) {
    console.error(
      `${colors.red}Please fix your database connection and run this script again.${colors.reset}`,
    );
    process.exit(1);
  }

  // Push schema to database
  pushSchemaToDatabase();
}

// Run main function
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
