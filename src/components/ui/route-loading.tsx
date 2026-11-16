/**
 * Rendered by Next.js from a route segment's `loading.tsx` — the App Router
 * wraps every segment in an implicit Suspense boundary and swaps this in as
 * the fallback while that segment's RSC payload is still streaming in (a
 * client-side navigation on a slow connection, or the initial request).
 * Server component, no client JS at all: the spinner is pure CSS
 * (`.iz-spinner`, `globals.css`) — M16 replaced `morphing-spinner.tsx`
 * (legacy cyan, `style jsx`) with it when that component was removed
 * along with the rest of the legacy sections.
 */
export function RouteLoading() {
  return (
    <div
      className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <div className="iz-spinner" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
