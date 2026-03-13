import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const block = process.env.BLOCK;

if (!block) {
  throw new Error("BLOCK env variable is required. Example: BLOCK=my-react-block");
}

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: resolve(import.meta.dirname, "assets"),
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, `src/${block}/index.tsx`),
      name: block.replace(/-./g, (m) => m[1].toUpperCase()),
      fileName: () => `${block}.js`,
      formats: ["iife"],
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
