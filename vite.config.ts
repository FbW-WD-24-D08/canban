import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

// Get the directory name in a way that works in both ESM and CJS
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      path: "path-browserify",
    },
  },
  // Ensure consistent line endings across platforms
  esbuild: {
    legalComments: "none",
    platform: "browser",
  },
  // Optimize for cross-platform development
  server: {
    watch: {
      usePolling: process.platform === "win32", // Enable polling on Windows
    },
  },
});
