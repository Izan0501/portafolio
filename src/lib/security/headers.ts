import { buildCsp } from "./csp";

/** The full header set applied to every route (plan §5.1's table), as the `{ key, value }[]` shape `next.config.ts`'s `headers()` expects. */
export function securityHeaders(isDevelopment: boolean): { key: string; value: string }[] {
  const headers = [
    // Enforced by default (fix/m17: the Report-Only trial period M14 ran
    // is over — Ivo confirmed moving straight to the real, blocking
    // header). `script-src` keeps `'unsafe-inline'` rather than a nonce:
    // a nonce must differ per request, which would force `/` and
    // `/projects/[id]` into dynamic rendering (confirmed against the
    // real Next 16 docs in `docs/next16-notes.md` §2) — Ivo re-confirmed
    // keeping that M14 trade-off when this came up again.
    { key: "Content-Security-Policy", value: buildCsp(isDevelopment) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Redundant with `frame-ancestors 'none'` above for browsers old
    // enough not to read CSP frame-ancestors — plan §5.1's own note.
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];

  // HSTS only in production (plan §5.1): asserting it over plain HTTP in
  // dev would make `localhost` itself refuse to downgrade back to HTTP
  // for the rest of its `max-age`, a self-inflicted lockout with no
  // production benefit.
  if (!isDevelopment) {
    headers.push({ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" });
  }

  return headers;
}
