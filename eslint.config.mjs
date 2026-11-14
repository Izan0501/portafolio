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
  // M14 (plan §5.1: "Enlaces externos: siempre con rel='noopener
  // noreferrer' y target='_blank'. Se valida en el lint") — the rule
  // ships with `eslint-config-next/core-web-vitals` but at severity 0
  // (confirmed with `eslint --print-config`); this turns it on instead
  // of adding a new plugin. Default options already require `noopener`
  // or `noreferrer` on any `target="_blank"` link, which is what actually
  // prevents the `window.opener` tabnabbing vulnerability the plan is
  // guarding against — every real external link in this codebase already
  // sets both, so this only adds a guardrail against a future one that doesn't.
  {
    rules: {
      "react/jsx-no-target-blank": "error",
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
