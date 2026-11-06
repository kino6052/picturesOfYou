import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const builtAssets = fileURLToPath(new URL("assets", import.meta.url));

// The build lands in the repo root, so emptyOutDir must stay off: it would wipe the repo.
// This removes only the previous build's hashed files.
const cleanBuiltAssets: Plugin = {
  name: "clean-built-assets",
  apply: "build",
  buildStart: () => rmSync(builtAssets, { recursive: true, force: true }),
};

export default defineConfig({
  root: "src",
  base: "./",
  build: { outDir: "..", emptyOutDir: false },
  plugins: [cleanBuiltAssets],
});
