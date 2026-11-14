/**
 * Content-Security-Policy string (plan §5.1). `script-src` uses
 * `'unsafe-inline'`, not the plan's literal `'nonce-{n}' 'strict-dynamic'`
 * — a nonce must differ per request, which forces every route reading it
 * into dynamic rendering (confirmed against the real Next 16 docs in
 * `docs/next16-notes.md` §2, not assumed). That would cost `/` and
 * `/projects/[id]` their static generation (SSG/CDN cache) for a policy
 * difference that, in practice, blocks nothing this site actually does —
 * Ivo confirmed `'unsafe-inline'` over that trade-off when M14 raised it.
 * `style-src 'unsafe-inline'` was already the plan's own choice (Motion's
 * inline styles), so this keeps both at the same relaxation instead of
 * strict for one and loose for the other.
 *
 * In development, React's dev server needs `'unsafe-eval'` for its own
 * stack traces (Next 16 docs' own CSP example conditions this the same
 * way) — never shipped to production.
 */
export function buildCsp(isDevelopment: boolean): string {
  const scriptSrc = isDevelopment ? "'self' 'unsafe-inline' 'unsafe-eval'" : "'self' 'unsafe-inline'";

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}
