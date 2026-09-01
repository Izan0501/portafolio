import { MorphingSpinner } from "@/components/ui/morphing-spinner";

/**
 * Rendered by Next.js from a route segment's `loading.tsx` — the App Router
 * wraps every segment in an implicit Suspense boundary and swaps this in as
 * the fallback while that segment's RSC payload is still streaming in (a
 * client-side navigation on a slow connection, or the initial request).
 * Server component: no client JS is spent mounting the fallback itself, only
 * the spinner inside it opts into "use client".
 */
export function RouteLoading() {
  return (
    <div
      className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <MorphingSpinner size="lg" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
