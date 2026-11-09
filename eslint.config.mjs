import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // react-hooks/immutability and react-hooks/refs are part of the newer,
  // React-Compiler-aware rule set eslint-config-next's core-web-vitals now
  // ships: they assume every value a hook returns, and every ref, is meant
  // to stay read-only/write-only-in-effects — correct for ordinary React
  // state, but incompatible with three.js, whose public API *is* mutating
  // objects directly (`uniform.value = x`, `mesh.position.set(...)`,
  // `scene.environment = texture`). Verified against the real lint output
  // before adding this override, not assumed: both rules fired on exactly
  // that pattern in Bench.tsx/Environment.tsx (M5), including on the
  // lazy-ref-init form React's own docs describe as valid
  // (`ref.current ??= …`) — there is no way to write idiomatic R3F code
  // under these two rules as configured. Scoped to `components/three/`
  // only; every other directory keeps both rules at full strength.
  {
    files: ["src/components/three/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
