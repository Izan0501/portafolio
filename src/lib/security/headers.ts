import { buildCsp } from "./csp";

/**
 * Plan §5.1 quality gate: "CSP en modo Report-Only durante un ciclo antes
 * de forzarla" — the header name itself switches, not just a flag inside
 * it. `Content-Security-Policy-Report-Only` makes browsers *log*
 * violations to devtools (visible without any `report-uri` backend —
 * none exists here) without blocking anything, so Ivo can browse the
 * real site with devtools open and confirm zero violations before
 * flipping `CSP_ENFORCE=true` to switch to the real, blocking header.
 * Defaults to Report-Only — the safer failure mode if this env var is
 * ever simply missing (e.g. a fresh deploy that hasn't set it yet).
 *
 * `next.config.ts`'s `headers()` is evaluated once at **build time**, not
 * per-request (confirmed in practice: starting `next start` with
 * `CSP_ENFORCE=true` set, against a build made without it, still served
 * the old Report-Only header) — `CSP_ENFORCE=true` has to be present for
 * the `next build` step itself, not just `next start`.
 */
function cspHeaderName(): string {
  return process.env.CSP_ENFORCE === "true" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";
}

/** The full header set applied to every route (plan §5.1's table), as the `{ key, value }[]` shape `next.config.ts`'s `headers()` expects. */
export function securityHeaders(isDevelopment: boolean): { key: string; value: string }[] {
  const headers = [
    { key: cspHeaderName(), value: buildCsp(isDevelopment) },
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
