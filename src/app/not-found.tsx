import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

/** Plan §5.2: "not-found.tsx con noindex" — a 404 page must never be indexed as if it were real content. */
export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center text-center px-6 bg-grafito">
      <p className="font-mono text-[13px] uppercase tracking-[0.04em] text-limon mb-4">404</p>
      <h1 className="text-h2 font-extrabold tracking-[-0.03em] text-hueso mb-3">Esta página no existe.</h1>
      <p className="text-lead text-texto-2 max-w-[440px] mb-8">El recorrido completo sigue disponible desde el inicio.</p>
      <Button variant="primary" href="/">
        Volver al inicio
      </Button>
    </main>
  );
}
