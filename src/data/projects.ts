import type { IconType } from "react-icons";
import { FiCalendar, FiDatabase, FiGlobe, FiLayout, FiServer } from "react-icons/fi";
import type { Locale } from "@/i18n/config";

export type ProjectStatus = "PROD" | "DEV";

/**
 * Translatable copy is stored next to the structural field it belongs to rather
 * than in a parallel dictionary tree. Index alignment between a project and its
 * translations therefore cannot drift, and TypeScript requires every locale.
 */
export type Localized<T> = Record<Locale, T>;

export interface GalleryImage {
  src: string;
  alt: Localized<string>;
  caption: Localized<string>;
  specs: Localized<string[]>;
}

export interface Project {
  id: string;
  index: string;
  /** Proper noun — identical in every locale, so not localized. */
  title: string;
  status: ProjectStatus;
  statusLabel: Localized<string>;
  /** Categorical architecture descriptor for the HUD stat — not a fabricated metric. */
  architecture: Localized<string>;
  /** Technology names — proper nouns, never translated. */
  stack: string[];
  location: Localized<string>;
  latency: Localized<string>;
  icon: IconType;
  heroImage: string;
  scope: Localized<string>;
  challenge: Localized<string>;
  objectives: Localized<string[]>;
  gallery: GalleryImage[];
  /** Left undefined until a real production URL exists — never fabricate one. */
  liveUrl?: string;
}

/** A project with every localized field already collapsed to the active locale. */
export interface ResolvedProject {
  id: string;
  index: string;
  title: string;
  status: ProjectStatus;
  statusLabel: string;
  architecture: string;
  stack: string[];
  location: string;
  latency: string;
  icon: IconType;
  heroImage: string;
  scope: string;
  challenge: string;
  objectives: string[];
  gallery: { src: string; alt: string; caption: string; specs: string[] }[];
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

const STATUS_LABELS = {
  production: { en: "PRODUCTION", es: "PRODUCCIÓN" },
  inDevelopment: { en: "IN DEVELOPMENT", es: "EN DESARROLLO" },
} satisfies Record<string, Localized<string>>;

export const PROJECTS_DATA: Project[] = [
  {
    id: "estudio-zanacchi",
    index: "01",
    title: "Estudio Zanacchi",
    status: "PROD",
    statusLabel: STATUS_LABELS.production,
    architecture: { en: "JAMSTACK / SSR", es: "JAMSTACK / SSR" },
    stack: ["Next.js 16", "Tailwind", "Sanity CMS", "Vercel"],
    location: { en: "VERCEL EDGE // GLOBAL CDN", es: "VERCEL EDGE // CDN GLOBAL" },
    latency: { en: "0.29ms", es: "0.29ms" },
    icon: FiGlobe,
    heroImage: STOCK_PHOTOS.workspace,
    scope: {
      en: "A high-performance marketing and client-facing site built to represent the studio's brand with an editorial, content-driven layout backed by a headless CMS.",
      es: "Un sitio institucional de alto rendimiento construido para representar la marca del estudio con un layout editorial orientado al contenido y respaldado por un CMS headless.",
    },
    challenge: {
      en: "Give non-technical staff full editorial control without ever letting a content edit regress the site's Core Web Vitals — the CMS layer had to stay invisible to performance.",
      es: "Dar control editorial total a personas sin perfil técnico sin que una edición de contenido degrade nunca los Core Web Vitals del sitio — la capa del CMS tenía que ser invisible para el rendimiento.",
    },
    objectives: {
      en: [
        "Ship a fast, SEO-ready marketing site on the App Router",
        "Give non-technical editors full control over content via Sanity",
        "Hit 100/100 Lighthouse performance on every core route",
      ],
      es: [
        "Publicar un sitio institucional rápido y listo para SEO sobre el App Router",
        "Dar a editores sin perfil técnico control total del contenido vía Sanity",
        "Alcanzar 100/100 de rendimiento en Lighthouse en cada ruta principal",
      ],
    },
    gallery: [
      {
        alt: {
          en: "Estudio Zanacchi — homepage layout",
          es: "Estudio Zanacchi — layout de la página principal",
        },
        caption: {
          en: "Homepage // Editorial Grid",
          es: "Página principal // Grilla editorial",
        },
        specs: {
          en: ["Statically generated with on-demand ISR revalidation", "Sanity webhook triggers targeted route revalidation"],
          es: ["Generación estática con revalidación ISR bajo demanda", "El webhook de Sanity dispara la revalidación de rutas puntuales"],
        },
        src: STOCK_PHOTOS.workspace,
      },
      {
        alt: {
          en: "Estudio Zanacchi — content management",
          es: "Estudio Zanacchi — gestión de contenido",
        },
        caption: {
          en: "Sanity Studio // Content Layer",
          es: "Sanity Studio // Capa de contenido",
        },
        specs: {
          en: ["Structured content schema decoupled from layout", "Editors publish without touching a deploy pipeline"],
          es: ["Esquema de contenido estructurado y desacoplado del layout", "Los editores publican sin tocar el pipeline de despliegue"],
        },
        src: STOCK_PHOTOS.darkTerminal,
      },
    ],
  },
  {
    id: "nave24-stock",
    index: "02",
    title: "Nave24 Stock",
    status: "PROD",
    statusLabel: STATUS_LABELS.production,
    architecture: { en: "MONOLITH + REALTIME", es: "MONOLITO + TIEMPO REAL" },
    stack: ["React", "Node.js", "PostgreSQL", "WebSockets"],
    location: { en: "AWS US-EAST // RDS", es: "AWS US-EAST // RDS" },
    latency: { en: "0.35ms", es: "0.35ms" },
    icon: FiDatabase,
    heroImage: STOCK_PHOTOS.dataStream,
    scope: {
      en: "A real-time warehouse inventory system tracking stock levels, movements, and reorder thresholds across multiple storage locations.",
      es: "Un sistema de inventario de depósito en tiempo real que registra niveles de stock, movimientos y umbrales de reposición en múltiples ubicaciones de almacenamiento.",
    },
    challenge: {
      en: "Multiple terminals write to the same stock counts concurrently — the system has to broadcast every movement instantly without ever letting two writers double-count the same unit.",
      es: "Varias terminales escriben sobre los mismos conteos de stock en simultáneo — el sistema tiene que difundir cada movimiento al instante sin permitir jamás que dos escrituras cuenten dos veces la misma unidad.",
    },
    objectives: {
      en: [
        "Give warehouse staff a live, always-accurate stock count",
        "Push real-time updates to every connected client via WebSockets",
        "Model multi-location inventory without double-counting stock",
      ],
      es: [
        "Dar al personal del depósito un conteo de stock en vivo y siempre exacto",
        "Enviar actualizaciones en tiempo real a cada cliente conectado vía WebSockets",
        "Modelar inventario multi-ubicación sin contar el stock dos veces",
      ],
    },
    // Real product screenshots — public/projects/nave24stock/. Captions describe
    // what is actually on screen in each one, not fabricated architecture claims.
    gallery: [
      {
        alt: {
          en: "Nave24 Stock — operations dashboard",
          es: "Nave24 Stock — panel de operaciones",
        },
        caption: {
          en: "Dashboard // Operations Overview",
          es: "Dashboard // Resumen de Operaciones",
        },
        specs: {
          en: ["Live KPI cards for capital, clients, stored products, and deliveries", "Recent-activity feed showing every restock transaction as it happens"],
          es: ["Tarjetas de KPI en vivo para capital, clientes, productos almacenados y entregas", "Feed de actividad reciente que muestra cada transacción de restock al momento"],
        },
        src: "/projects/nave24stock/stock-dash.png",
      },
      {
        alt: {
          en: "Nave24 Stock — supplier purchase history",
          es: "Nave24 Stock — historial de compras a proveedores",
        },
        caption: {
          en: "Suppliers // Restock & Purchase History",
          es: "Proveedores // Historial de Restocks y Compras",
        },
        specs: {
          en: ["Full restock history per supplier with item counts and total cost", "Searchable by supplier name and date range"],
          es: ["Historial completo de restocks por proveedor con cantidad de ítems y costo total", "Búsqueda por nombre de proveedor y rango de fechas"],
        },
        src: "/projects/nave24stock/stock-suppliers.png",
      },
      {
        alt: {
          en: "Nave24 Stock — inventory management table",
          es: "Nave24 Stock — tabla de gestión de inventario",
        },
        caption: {
          en: "Inventory // Stock Levels by Category",
          es: "Inventario // Niveles de Stock por Categoría",
        },
        specs: {
          en: ["50+ SKUs filterable by category, with cost, price, and live stock count per item", "Color-coded stock badges flag low-quantity items before they run out"],
          es: ["Más de 50 productos filtrables por categoría, con costo, precio y stock en vivo por ítem", "Insignias de stock con código de color que alertan productos con baja cantidad"],
        },
        src: "/projects/nave24stock/stock-inventory.png",
      },
      {
        alt: {
          en: "Nave24 Stock — new sale customer selection",
          es: "Nave24 Stock — selección de cliente en nueva venta",
        },
        caption: {
          en: "Sales // Customer Lookup & Checkout",
          es: "Ventas // Búsqueda de Clientes y Checkout",
        },
        specs: {
          en: ["Customer search filterable by neighborhood, with inline create for first-time buyers", "Each sale is tied to a real customer record for repeat-purchase tracking"],
          es: ["Búsqueda de clientes filtrable por barrio, con creación en línea para compradores nuevos", "Cada venta queda asociada a un cliente real para seguimiento de compras recurrentes"],
        },
        src: "/projects/nave24stock/stock-sales.png",
      },
    ],
  },
  {
    id: "consultorio-odontologico",
    index: "03",
    title: "Consultorio Odontológico",
    status: "DEV",
    statusLabel: STATUS_LABELS.inDevelopment,
    architecture: { en: "SSR MONOLITH", es: "MONOLITO SSR" },
    stack: ["Next.js", "MongoDB", "Booking Engine", "Tailwind"],
    location: { en: "STAGING CLUSTER // DEV", es: "CLÚSTER DE STAGING // DEV" },
    latency: { en: "8.4ms (staging)", es: "8.4ms (staging)" },
    icon: FiCalendar,
    heroImage: STOCK_PHOTOS.codeClose,
    scope: {
      en: "A patient-facing booking and scheduling platform for a dental practice — appointment requests, availability, and treatment history in one place.",
      es: "Una plataforma de turnos y agenda orientada al paciente para un consultorio odontológico — solicitudes de turno, disponibilidad e historial de tratamientos en un solo lugar.",
    },
    challenge: {
      en: "Several practitioners share overlapping availability windows — the booking engine has to guarantee no two patients can ever claim the same slot, even under simultaneous requests.",
      es: "Varios profesionales comparten ventanas de disponibilidad superpuestas — el motor de turnos debe garantizar que dos pacientes nunca puedan tomar el mismo horario, incluso con solicitudes simultáneas.",
    },
    objectives: {
      en: [
        "Let patients book and reschedule appointments online",
        "Give the front desk a single calendar view across practitioners",
        "Store treatment history per patient in a structured, searchable form",
      ],
      es: [
        "Permitir que los pacientes reserven y reprogramen turnos en línea",
        "Dar a recepción una vista de calendario unificada entre profesionales",
        "Guardar el historial de tratamientos por paciente de forma estructurada y consultable",
      ],
    },
    gallery: [
      {
        alt: {
          en: "Consultorio Odontológico — booking calendar",
          es: "Consultorio Odontológico — calendario de turnos",
        },
        caption: {
          en: "Booking Engine // Availability View",
          es: "Motor de turnos // Vista de disponibilidad",
        },
        specs: {
          en: ["Atomic slot-claim to prevent double-booking", "Per-practitioner calendar merge view"],
          es: ["Reserva atómica del horario para evitar duplicados", "Vista combinada de calendarios por profesional"],
        },
        src: STOCK_PHOTOS.codeClose,
      },
      {
        alt: {
          en: "Consultorio Odontológico — patient records",
          es: "Consultorio Odontológico — fichas de pacientes",
        },
        caption: {
          en: "MongoDB // Patient Records",
          es: "MongoDB // Fichas de pacientes",
        },
        specs: {
          en: ["Structured treatment-history documents per patient", "Indexed search across appointment history"],
          es: ["Documentos estructurados de historial clínico por paciente", "Búsqueda indexada sobre el historial de turnos"],
        },
        src: STOCK_PHOTOS.darkTerminal,
      },
    ],
  },
  {
    id: "portafolio-mel",
    index: "04",
    title: "Portafolio Mel",
    status: "DEV",
    statusLabel: STATUS_LABELS.inDevelopment,
    architecture: { en: "STATIC / JAMSTACK", es: "ESTÁTICO / JAMSTACK" },
    stack: ["Next.js", "Framer Motion", "Tailwind", "Vercel"],
    location: { en: "PREVIEW BUILD // DEV", es: "BUILD DE PREVIEW // DEV" },
    latency: { en: "6.1ms (staging)", es: "6.1ms (staging)" },
    icon: FiLayout,
    heroImage: STOCK_PHOTOS.workspace,
    scope: {
      en: "A kinetic, image-forward personal portfolio built to showcase creative work with fluid page transitions and a distinct visual identity.",
      es: "Un portfolio personal cinético y centrado en la imagen, construido para exhibir trabajo creativo con transiciones fluidas y una identidad visual propia.",
    },
    challenge: {
      en: "Full-bleed imagery and layered motion transitions are heavy by default — the build has to stay buttery on mid-range mobile hardware, not just on a dev machine.",
      es: "Las imágenes a sangre completa y las transiciones en capas son pesadas por naturaleza — el build tiene que seguir siendo fluido en hardware móvil de gama media, no solo en una máquina de desarrollo.",
    },
    objectives: {
      en: [
        "Build a fast, gallery-first layout for visual work",
        "Add fluid Framer Motion page/section transitions",
        "Keep the CMS-free content model simple enough to update solo",
      ],
      es: [
        "Construir un layout rápido y centrado en la galería para trabajo visual",
        "Sumar transiciones fluidas de página y sección con Framer Motion",
        "Mantener el modelo de contenido sin CMS simple de actualizar en solitario",
      ],
    },
    gallery: [
      {
        alt: {
          en: "Portafolio Mel — gallery layout",
          es: "Portafolio Mel — layout de galería",
        },
        caption: {
          en: "Gallery // Featured Work Grid",
          es: "Galería // Grilla de trabajos destacados",
        },
        specs: {
          en: ["Lazy-loaded image grid with blur-up placeholders", "GPU-composited transitions via transform/opacity only"],
          es: ["Grilla de imágenes con carga diferida y placeholders difuminados", "Transiciones compuestas por GPU usando solo transform y opacity"],
        },
        src: STOCK_PHOTOS.workspace,
      },
      {
        alt: {
          en: "Portafolio Mel — project detail transition",
          es: "Portafolio Mel — transición al detalle de proyecto",
        },
        caption: {
          en: "Motion // Page Transitions",
          es: "Motion // Transiciones de página",
        },
        specs: {
          en: ["Shared-layout transitions between grid and detail", "Reduced-motion fallback respected site-wide"],
          es: ["Transiciones de layout compartido entre grilla y detalle", "Alternativa de movimiento reducido respetada en todo el sitio"],
        },
        src: STOCK_PHOTOS.codeClose,
      },
    ],
  },
  {
    id: "veebot-saas",
    index: "05",
    title: "VeeBot SaaS",
    status: "DEV",
    statusLabel: STATUS_LABELS.inDevelopment,
    architecture: { en: "MICROSERVICES", es: "MICROSERVICIOS" },
    stack: ["MongoDB", "FastAPI", "Python", "OCR Engine"],
    location: { en: "DOCKER SWARM // STAGING", es: "DOCKER SWARM // STAGING" },
    latency: { en: "5.7ms (staging)", es: "5.7ms (staging)" },
    icon: FiServer,
    heroImage: STOCK_PHOTOS.serverRack,
    scope: {
      en: "A multi-tenant SaaS platform that ingests PDFs and scanned documents, extracts structured data via OCR, and automates reservation workflows.",
      es: "Una plataforma SaaS multi-tenant que ingiere PDFs y documentos escaneados, extrae datos estructurados mediante OCR y automatiza flujos de reservas.",
    },
    challenge: {
      en: "Every tenant's documents flow through the same OCR pipeline — services have to scale independently under load while keeping tenant data fully isolated end-to-end.",
      es: "Los documentos de cada tenant atraviesan el mismo pipeline de OCR — los servicios tienen que escalar de forma independiente bajo carga manteniendo los datos de cada tenant completamente aislados de punta a punta.",
    },
    objectives: {
      en: [
        "Automate document intake with an OCR extraction pipeline",
        "Support multiple tenants on isolated Docker Swarm services",
        "Turn extracted data into an automated reservation workflow",
      ],
      es: [
        "Automatizar la recepción de documentos con un pipeline de extracción OCR",
        "Soportar múltiples tenants sobre servicios aislados en Docker Swarm",
        "Convertir los datos extraídos en un flujo de reservas automatizado",
      ],
    },
    gallery: [
      {
        alt: {
          en: "VeeBot SaaS — OCR extraction pipeline",
          es: "VeeBot SaaS — pipeline de extracción OCR",
        },
        caption: {
          en: "OCR Engine // Document Pipeline",
          es: "Motor OCR // Pipeline de documentos",
        },
        specs: {
          en: ["Async ingestion queue decouples upload from processing", "Per-tenant isolated processing services"],
          es: ["La cola de ingesta asíncrona desacopla la carga del procesamiento", "Servicios de procesamiento aislados por tenant"],
        },
        src: STOCK_PHOTOS.serverRack,
      },
      {
        alt: {
          en: "VeeBot SaaS — reservation workflow",
          es: "VeeBot SaaS — flujo de reservas",
        },
        caption: {
          en: "FastAPI // Reservation Workflow",
          es: "FastAPI // Flujo de reservas",
        },
        specs: {
          en: ["Extracted fields auto-populate reservation records", "Swarm-scaled API services behind a load balancer"],
          es: ["Los campos extraídos completan automáticamente los registros de reserva", "Servicios de API escalados en Swarm detrás de un balanceador de carga"],
        },
        src: STOCK_PHOTOS.dataStream,
      },
    ],
  },
];

export function getProjectById(id: string): Project | undefined {
  return PROJECTS_DATA.find((project) => project.id === id);
}

/** Collapses every `Localized` field down to the active locale. */
export function resolveProject(project: Project, locale: Locale): ResolvedProject {
  return {
    id: project.id,
    index: project.index,
    title: project.title,
    status: project.status,
    statusLabel: project.statusLabel[locale],
    architecture: project.architecture[locale],
    stack: project.stack,
    location: project.location[locale],
    latency: project.latency[locale],
    icon: project.icon,
    heroImage: project.heroImage,
    scope: project.scope[locale],
    challenge: project.challenge[locale],
    objectives: project.objectives[locale],
    gallery: project.gallery.map((image) => ({
      src: image.src,
      alt: image.alt[locale],
      caption: image.caption[locale],
      specs: image.specs[locale],
    })),
    liveUrl: project.liveUrl,
  };
}

export function getResolvedProject(id: string, locale: Locale): ResolvedProject | undefined {
  const project = getProjectById(id);
  return project ? resolveProject(project, locale) : undefined;
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
