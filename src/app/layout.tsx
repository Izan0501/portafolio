import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { Navbar } from "@/components/navigation/Navbar";
import { ConditionalFooter } from "@/components/navigation/ConditionalFooter";
import { DEFAULT_LOCALE } from "@/i18n/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const firaCode = Fira_Code({ subsets: ["latin"], variable: "--font-fira-code" });

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
      <body
        className={`${inter.variable} ${firaCode.variable} font-sans bg-neutral-950 text-neutral-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-400 overflow-x-hidden`}
      >
        <SmoothScrollProvider>
          {/* Inside SmoothScrollProvider so the provider can reach the Lenis
              instance and re-measure scroll height when copy length changes. */}
          <LanguageProvider>
            <div className="min-h-screen w-full relative flex flex-col justify-between">
              {/* Ambient subtle background grid for high-tech depth */}
              <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #ffffff05 1px, transparent 1px), linear-gradient(to bottom, #ffffff05 1px, transparent 1px)",
                  backgroundSize: "64px 64px",
                }}
                aria-hidden="true"
              />

              <Navbar />
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
