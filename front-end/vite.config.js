import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  dev: {
    port: 5173,
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 5173,
  },
  plugins: [react()],
  build: {
    target: "esnext",
    outDir: "dist", // Default output directory
  },
});
