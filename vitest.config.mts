import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Vitest doesn't read `tsconfig.json`'s `paths` on its own — it needs its own
 * `resolve.alias` to know `@/*` means `src/*`. No extra package required:
 * `vitest/config` already re-exports Vite's `defineConfig`/`resolve.alias`.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
});
