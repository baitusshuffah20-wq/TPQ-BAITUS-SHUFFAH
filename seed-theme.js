const { exec } = require("child_process");

exec(
  'npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed-theme.ts',
  (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return;
    }
    console.log(`Stdout: ${stdout}`);
  },
);
