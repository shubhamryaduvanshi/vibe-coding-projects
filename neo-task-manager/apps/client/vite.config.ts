import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@neo/types": path.resolve(__dirname, "../../packages/types/src/index.ts"),
      "@neo/ui": path.resolve(__dirname, "../../packages/ui/src/index.ts"),
      "@neo/utils": path.resolve(__dirname, "../../packages/utils/src/index.ts")
    }
  },
  server: {
    port: 5173
  }
});

