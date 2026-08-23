import type { IconType } from "react-icons";
import { FiCalendar, FiDatabase, FiGlobe, FiLayout, FiServer } from "react-icons/fi";

export type ProjectStatus = "PROD" | "DEV";

export interface GalleryImage {
  src: string;
  alt: string;
  caption: string;
  specs: string[];
}

export interface Project {
  id: string;
  index: string;
  title: string;
  status: ProjectStatus;
  statusLabel: string;
  /** Categorical architecture descriptor for the HUD stat — not a fabricated metric. */
  architecture: string;
  stack: string[];
  location: string;
  latency: string;
  icon: IconType;
  heroImage: string;
  scope: string;
  challenge: string;
  objectives: string[];
  gallery: GalleryImage[];
  /** Left undefined until a real production URL exists — never fabricate one. */
  liveUrl?: string;
}

// Verified-loading placeholder photography already used elsewhere on the site.
// Swap these for real project screenshots whenever they're ready.
const STOCK_PHOTOS = {
  darkTerminal: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2670&auto=format&fit=crop",
  codeClose: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
  workspace: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
  dataStream: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop",
  serverRack: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop",
} as const;

export const PROJECTS_DATA: Project[] = [
  {
    id: "estudio-zanacchi",
    index: "01",
    title: "Estudio Zanacchi",
    status: "PROD",
    statusLabel: "PRODUCTION",
    architecture: "JAMSTACK / SSR",
    stack: ["Next.js 16", "Tailwind", "Sanity CMS", "Vercel"],
    location: "VERCEL EDGE // GLOBAL CDN",
    latency: "0.29ms",
    icon: FiGlobe,
    heroImage: STOCK_PHOTOS.workspace,
    scope: "A high-performance marketing and client-facing site built to represent the studio's brand with an editorial, content-driven layout backed by a headless CMS.",
    challenge: "Give non-technical staff full editorial control without ever letting a content edit regress the site's Core Web Vitals — the CMS layer had to stay invisible to performance.",
    objectives: [
      "Ship a fast, SEO-ready marketing site on the App Router",
      "Give non-technical editors full control over content via Sanity",
      "Hit 100/100 Lighthouse performance on every core route",
    ],
    gallery: [
      {
        alt: "Estudio Zanacchi — homepage layout",
        caption: "Homepage // Editorial Grid",
        specs: ["Statically generated with on-demand ISR revalidation", "Sanity webhook triggers targeted route revalidation"],
        src: STOCK_PHOTOS.workspace,
      },
      {
        alt: "Estudio Zanacchi — content management",
        caption: "Sanity Studio // Content Layer",
        specs: ["Structured content schema decoupled from layout", "Editors publish without touching a deploy pipeline"],
        src: STOCK_PHOTOS.darkTerminal,
      },
    ],
  },
  {
    id: "nave24-stock",
    index: "02",
    title: "Nave24 Stock",
    status: "PROD",
    statusLabel: "PRODUCTION",
    architecture: "MONOLITH + REALTIME",
    stack: ["React", "Node.js", "PostgreSQL", "WebSockets"],
    location: "AWS US-EAST // RDS",
    latency: "0.35ms",
    icon: FiDatabase,
    heroImage: STOCK_PHOTOS.dataStream,
    scope: "A real-time warehouse inventory system tracking stock levels, movements, and reorder thresholds across multiple storage locations.",
    challenge: "Multiple terminals write to the same stock counts concurrently — the system has to broadcast every movement instantly without ever letting two writers double-count the same unit.",
    objectives: [
      "Give warehouse staff a live, always-accurate stock count",
      "Push real-time updates to every connected client via WebSockets",
      "Model multi-location inventory without double-counting stock",
    ],
    gallery: [
      {
        alt: "Nave24 Stock — live inventory dashboard",
        caption: "Dashboard // Live Stock Levels",
        specs: ["WebSocket broadcast on every stock movement", "Optimistic UI reconciled against server truth"],
        src: STOCK_PHOTOS.dataStream,
      },
      {
        alt: "Nave24 Stock — database schema",
        caption: "PostgreSQL // Inventory Schema",
        specs: ["Row-level locking on concurrent stock writes", "Multi-location schema with per-warehouse ledgers"],
        src: STOCK_PHOTOS.serverRack,
      },
    ],
  },
  {
    id: "consultorio-odontologico",
    index: "03",
    title: "Consultorio Odontológico",
    status: "DEV",
    statusLabel: "IN DEVELOPMENT",
    architecture: "SSR MONOLITH",
    stack: ["Next.js", "MongoDB", "Booking Engine", "Tailwind"],
    location: "STAGING CLUSTER // DEV",
    latency: "8.4ms (staging)",
    icon: FiCalendar,
    heroImage: STOCK_PHOTOS.codeClose,
    scope: "A patient-facing booking and scheduling platform for a dental practice — appointment requests, availability, and treatment history in one place.",
    challenge: "Several practitioners share overlapping availability windows — the booking engine has to guarantee no two patients can ever claim the same slot, even under simultaneous requests.",
    objectives: [
      "Let patients book and reschedule appointments online",
      "Give the front desk a single calendar view across practitioners",
      "Store treatment history per patient in a structured, searchable form",
    ],
    gallery: [
      {
        alt: "Consultorio Odontológico — booking calendar",
        caption: "Booking Engine // Availability View",
        specs: ["Atomic slot-claim to prevent double-booking", "Per-practitioner calendar merge view"],
        src: STOCK_PHOTOS.codeClose,
      },
      {
        alt: "Consultorio Odontológico — patient records",
        caption: "MongoDB // Patient Records",
        specs: ["Structured treatment-history documents per patient", "Indexed search across appointment history"],
        src: STOCK_PHOTOS.darkTerminal,
      },
    ],
  },
  {
    id: "portafolio-mel",
    index: "04",
    title: "Portafolio Mel",
    status: "DEV",
    statusLabel: "IN DEVELOPMENT",
    architecture: "STATIC / JAMSTACK",
    stack: ["Next.js", "Framer Motion", "Tailwind", "Vercel"],
    location: "PREVIEW BUILD // DEV",
    latency: "6.1ms (staging)",
    icon: FiLayout,
    heroImage: STOCK_PHOTOS.workspace,
    scope: "A kinetic, image-forward personal portfolio built to showcase creative work with fluid page transitions and a distinct visual identity.",
    challenge: "Full-bleed imagery and layered motion transitions are heavy by default — the build has to stay buttery on mid-range mobile hardware, not just on a dev machine.",
    objectives: [
      "Build a fast, gallery-first layout for visual work",
      "Add fluid Framer Motion page/section transitions",
      "Keep the CMS-free content model simple enough to update solo",
    ],
    gallery: [
      {
        alt: "Portafolio Mel — gallery layout",
        caption: "Gallery // Featured Work Grid",
        specs: ["Lazy-loaded image grid with blur-up placeholders", "GPU-composited transitions via transform/opacity only"],
        src: STOCK_PHOTOS.workspace,
      },
      {
        alt: "Portafolio Mel — project detail transition",
        caption: "Motion // Page Transitions",
        specs: ["Shared-layout transitions between grid and detail", "Reduced-motion fallback respected site-wide"],
        src: STOCK_PHOTOS.codeClose,
      },
    ],
  },
  {
    id: "veebot-saas",
    index: "05",
    title: "VeeBot SaaS",
    status: "DEV",
    statusLabel: "IN DEVELOPMENT",
    architecture: "MICROSERVICES",
    stack: ["MongoDB", "FastAPI", "Python", "OCR Engine"],
    location: "DOCKER SWARM // STAGING",
    latency: "5.7ms (staging)",
    icon: FiServer,
    heroImage: STOCK_PHOTOS.serverRack,
    scope: "A multi-tenant SaaS platform that ingests PDFs and scanned documents, extracts structured data via OCR, and automates reservation workflows.",
    challenge: "Every tenant's documents flow through the same OCR pipeline — services have to scale independently under load while keeping tenant data fully isolated end-to-end.",
    objectives: [
      "Automate document intake with an OCR extraction pipeline",
      "Support multiple tenants on isolated Docker Swarm services",
      "Turn extracted data into an automated reservation workflow",
    ],
    gallery: [
      {
        alt: "VeeBot SaaS — OCR extraction pipeline",
        caption: "OCR Engine // Document Pipeline",
        specs: ["Async ingestion queue decouples upload from processing", "Per-tenant isolated processing services"],
        src: STOCK_PHOTOS.serverRack,
      },
      {
        alt: "VeeBot SaaS — reservation workflow",
        caption: "FastAPI // Reservation Workflow",
        specs: ["Extracted fields auto-populate reservation records", "Swarm-scaled API services behind a load balancer"],
        src: STOCK_PHOTOS.dataStream,
      },
    ],
  },
];

export function getProjectById(id: string): Project | undefined {
  return PROJECTS_DATA.find((project) => project.id === id);
}

// Shared PROD/DEV visual hierarchy — PROD reads as live (emerald, pulsing),
// DEV reads as in-progress (amber, static) — used by both the deployment
// matrix and the project detail page so the two never drift apart.
export const STATUS_STYLES: Record<
  ProjectStatus,
  { accent: string; badgeBg: string; badgeBorder: string; dotGlow: string; pulse: boolean }
> = {
  PROD: {
    accent: "text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    dotGlow: "shadow-[0_0_8px_rgba(52,211,153,1)]",
    pulse: true,
  },
  DEV: {
    accent: "text-amber-400",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    dotGlow: "shadow-[0_0_8px_rgba(251,191,36,0.9)]",
    pulse: false,
  },
};
