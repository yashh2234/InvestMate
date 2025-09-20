// backend/tests/setup.js
const { execSync } = require("child_process");

beforeAll(async () => {
  console.log("Setting up backend test environment...");
  // Example: execSync("npm run migrate:test");
});

afterAll(async () => {
  console.log("Cleaning up backend test environment...");
  // Example: execSync("npm run drop:test");
});
