import type { Metadata } from "next";
import { Schibsted_Grotesk, Martian_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { DynamicIslandNav } from "@/components/iphone-island/DynamicIslandNav";
import { ConditionalFooter } from "@/components/navigation/ConditionalFooter";
import { DEFAULT_LOCALE } from "@/i18n/config";

// DESIGN.md §2 · Tipografía (docs/reference/artifact-a/DESIGN.dc.html).
// Both are variable fonts in Next's real Google font catalog (verified against
// node_modules/next/dist/compiled/@next/font/dist/google/font-data.json before
// writing this): Schibsted Grotesk wght 400-900, Martian Mono wght 100-800 +
// wdth 75-112.5. `display: 'swap'` and `adjustFontFallback: true` are already
// next/font's defaults (verified in node_modules/next/dist/docs) — not repeated
// here as options, just relied on for the CLS ≈ 0 requirement.
const schibstedGrotesk = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-schibsted" });
const martianMono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian",
  // Only `wght` loads by default (next/font keeps axes minimal for file size).
  // DESIGN.md calls for `font-stretch: 87.5%` on every Martian Mono use, which
  // needs the `wdth` axis actually present in the variable font file.
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Ivo Zanacchi | Full-Stack Software Engineer & DevOps",
  description:
    "High-performance software architecture, scalable backend systems, and precision-engineered web applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The server always renders the default locale. LanguageProvider rewrites
  // document.documentElement.lang on the client once the real one is resolved,
  // which keeps the SSR markup and the first client render identical.
  return (
    <html lang={DEFAULT_LOCALE} className="dark scroll-smooth">
      <head>
        {/* Runs before hydration: without this, the browser's own scroll-restoration
            (or a lingering "#deployment-matrix" left in the URL from an earlier visit)
            can land a plain reload mid-page instead of at the top. SmoothScrollProvider
            still owns scrolling to a hash on an actual client-side navigation. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if ("scrollRestoration" in window.history) { window.history.scrollRestoration = "manual"; }`,
          }}
        />
      </head>
      <body
        className={`${schibstedGrotesk.variable} ${martianMono.variable} font-sans bg-grafito text-hueso antialiased selection:bg-limon/20 selection:text-limon overflow-x-clip`}
      >
        <SmoothScrollProvider>
          {/* Inside SmoothScrollProvider so the provider can reach the Lenis
              instance and re-measure scroll height when copy length changes. */}
          <LanguageProvider>
            <div className="min-h-screen w-full relative flex flex-col justify-between">
              <DynamicIslandNav />
              <main className="relative z-10 flex-grow w-full">
                {children}
              </main>
              <ConditionalFooter />
            </div>
          </LanguageProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
