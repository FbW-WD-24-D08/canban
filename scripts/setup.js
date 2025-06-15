#!/usr/bin/env node

/**
 * Simple cross-platform setup script for Canban project
 * Works on both Windows and Linux environments
 */

const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up Canban development environment...");

// Create .env file if it doesn't exist
const envPath = path.join(process.cwd(), ".env");
const exampleEnvPath = path.join(process.cwd(), "example.env");

if (!fs.existsSync(envPath) && fs.existsSync(exampleEnvPath)) {
  console.log("📄 Creating .env file from example.env...");
  fs.copyFileSync(exampleEnvPath, envPath);
  console.log("✅ Created .env file. Please update with your own values.");
}

// Ensure db directory exists
const dbDir = path.join(process.cwd(), "db");
if (!fs.existsSync(dbDir)) {
  console.log("📁 Creating db directory...");
  fs.mkdirSync(dbDir);
}

// Ensure db.json exists
const dbPath = path.join(dbDir, "db.json");
if (!fs.existsSync(dbPath)) {
  console.log("📄 Creating empty db.json file...");
  fs.writeFileSync(dbPath, JSON.stringify({ tasks: [] }, null, 2));
}

console.log('✨ Setup complete! Run "npm run dev:full" to start development.');
