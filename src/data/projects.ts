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

/**
 * Optional tab grouping for galleries large enough that one row per screenshot
 * would run the detail page far past its siblings. `id` is locale-invariant so
 * the active tab survives a language switch; only `label` is translated.
 * Projects that omit it render exactly as before — one row per image.
 */
export interface GalleryGroup {
  id: string;
  label: Localized<string>;
}

export interface GalleryImage {
  src: string;
  alt: Localized<string>;
  caption: Localized<string>;
  specs: Localized<string[]>;
  group?: GalleryGroup;
  /**
   * Screenshots far from the 16:9 frame (near-square wizard steps, 3:1 panels)
   * lose real content to `object-cover`. Set "contain" to letterbox instead.
   * Defaults to "cover", so existing entries are unaffected.
   */
  fit?: "cover" | "contain";
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
  gallery: {
    src: string;
    alt: string;
    caption: string;
    specs: string[];
    group?: { id: string; label: string };
    fit?: "cover" | "contain";
  }[];
  liveUrl?: string;
}

const STATUS_LABELS = {
  production: { en: "PRODUCTION", es: "PRODUCCIÓN" },
  inDevelopment: { en: "IN DEVELOPMENT", es: "EN DESARROLLO" },
} satisfies Record<string, Localized<string>>;

// Shared so every image in a tab points at one object — a typo in a group id
// can't silently split a tab in two.
// Declared in the order the tabs appear, which is driven by the order each
// group first shows up in the gallery array below — keep the two in step.
const GALLERY_GROUPS = {
  veebotOnboarding: { id: "onboarding", label: { en: "AGENCY ONBOARDING", es: "ONBOARDING DE AGENCIA" } },
  veebotTalentHub: { id: "talent-hub", label: { en: "TALENT HUB", es: "PANEL DE TALENTO" } },
  veebotAiTools: { id: "ai-tools", label: { en: "AI TOOLS", es: "HERRAMIENTAS DE IA" } },
  veebotWorkspace: { id: "workspace", label: { en: "WORKSPACE", es: "ESPACIO DE TRABAJO" } },
  veebotSupport: { id: "support", label: { en: "SUPPORT & HELP", es: "SOPORTE Y AYUDA" } },

  estudioLanding: { id: "estudio-landing", label: { en: "LANDING & BRAND", es: "LANDING Y MARCA" } },
  estudioPractice: { id: "estudio-practice", label: { en: "PRACTICE AREAS", es: "ÁREAS DE PRÁCTICA" } },
  estudioSocialProof: { id: "estudio-social-proof", label: { en: "TESTIMONIALS & METHOD", es: "TESTIMONIOS Y MÉTODO" } },
  estudioNews: { id: "estudio-news", label: { en: "NEWS & MEDIA", es: "NOTICIAS Y MEDIOS" } },
  estudioContact: { id: "estudio-contact", label: { en: "CONTACT & INTAKE", es: "CONTACTO E INICIO" } },

  portafolioMelLanding: { id: "portafolio-mel-landing", label: { en: "LANDING & HERO", es: "LANDING Y HERO" } },
  portafolioMelGallery: { id: "portafolio-mel-gallery", label: { en: "GALLERIES & WORK", es: "GALERÍAS Y TRABAJO" } },
  portafolioMelAbout: { id: "portafolio-mel-about", label: { en: "ABOUT & APPROACH", es: "SOBRE MÍ Y ENFOQUE" } },
  portafolioMelContact: { id: "portafolio-mel-contact", label: { en: "CONTACT & BOOKING", es: "CONTACTO Y BOOKING" } },
} satisfies Record<string, GalleryGroup>;

export const PROJECTS_DATA: Project[] = [
  {
    id: "nave24-stock",
    index: "01",
    title: "Nave24 Stock",
    status: "PROD",
    statusLabel: STATUS_LABELS.production,
    architecture: { en: "MONOLITH + REALTIME", es: "MONOLITO + TIEMPO REAL" },
    stack: ["React", "Vite", "TypeScript", "Tailwind", "FastAPI", "PostgreSQL", "Docker", "Supabase"],
    location: { en: "SUPABASE // DOCKER", es: "SUPABASE // DOCKER" },
    latency: { en: "0.35ms", es: "0.35ms" },
    icon: FiDatabase,
    heroImage: "/projects/nave24stock/stock-back.png",
    scope: {
      en: "A real-time warehouse inventory system tracking stock levels, movements, and reorder thresholds across multiple storage locations.",
      es: "Un sistema de inventario de depósito en tiempo real que registra niveles de stock, movimientos y umbrales de reposición en múltiples ubicaciones de almacenamiento.",
    },
    challenge: {
      en: "Multiple terminals write to the same stock counts concurrently. The system has to broadcast every movement instantly without ever letting two writers double-count the same unit.",
      es: "Varias terminales escriben sobre los mismos conteos de stock en simultáneo. El sistema tiene que difundir cada movimiento al instante sin permitir jamás que dos escrituras cuenten dos veces la misma unidad.",
    },
    objectives: {
      en: [
        "Give warehouse staff a live, always-accurate stock count",
        "Push real-time updates to every connected client via Supabase Realtime",
        "Model multi-location inventory without double-counting stock",
      ],
      es: [
        "Dar al personal del depósito un conteo de stock en vivo y siempre exacto",
        "Enviar actualizaciones en tiempo real a cada cliente conectado vía Supabase Realtime",
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
    id: "veebot-saas",
    index: "02",
    title: "VeeBot SaaS",
    status: "DEV",
    statusLabel: STATUS_LABELS.inDevelopment,
    architecture: { en: "MICROSERVICES", es: "MICROSERVICIOS" },
    stack: ["React", "Vite", "Framer Motion", "Tailwind", "FastAPI", "MongoDB", "Pinecone", "Gemini 2.5 Flash"],
    location: { en: "STAGING // CI/CD PIPELINE", es: "STAGING // CI/CD PIPELINE" },
    latency: { en: "5.7ms (staging)", es: "5.7ms (staging)" },
    icon: FiServer,
    heroImage: "/projects/veeBot/bot-back1.png",
    scope: {
      en: "A multi-tenant SaaS recruiting platform where an AI pipeline scores, compares, and interviews every candidate CV, turning raw résumés into structured, searchable talent intelligence for recruiting agencies. The analysis engine has since moved from Groq's Llama 3.3 70B Versatile to Gemini 2.5 Flash for deeper contextual scoring.",
      es: "Una plataforma SaaS de reclutamiento multi-tenant donde un pipeline de IA puntúa, compara y entrevista cada CV de candidato, convirtiendo currículums en bruto en inteligencia de talento estructurada y consultable para agencias de selección. El motor de análisis pasó de Llama 3.3 70B Versatile de Groq a Gemini 2.5 Flash para un análisis contextual más profundo.",
    },
    challenge: {
      en: "Every tenant's candidate data flows through the same AI scoring and embedding pipeline. The platform has to keep each agency's talent pool fully isolated while still scaling AI inference independently under load.",
      es: "Los datos de candidatos de cada tenant atraviesan el mismo pipeline de scoring y embeddings de IA. La plataforma tiene que mantener el pool de talento de cada agencia completamente aislado mientras escala la inferencia de IA de forma independiente bajo carga.",
    },
    objectives: {
      en: [
        "Score and rank every imported CV automatically with an AI analysis pipeline",
        "Embed candidate profiles in Pinecone for meaning-based, not just keyword, search",
        "Support multiple tenants on isolated, independently scalable FastAPI services",
        "Notify recruiters and candidates through automated SMTP email flows",
      ],
      es: [
        "Puntuar y rankear cada CV importado automáticamente con un pipeline de análisis de IA",
        "Vectorizar los perfiles de candidatos en Pinecone para búsqueda por significado, no solo por palabra clave",
        "Soportar múltiples tenants sobre servicios FastAPI aislados y escalables de forma independiente",
        "Notificar a reclutadores y candidatos mediante flujos de email automatizados por SMTP",
      ],
    },
    // Real product screenshots — public/projects/veeBot/. All 20 captures split
    // across six tabs (see GalleryGroup) so the page stays close in length to
    // its sibling projects. Captions describe what is actually on each screen;
    // `fit: "contain"` marks the captures too far from 16:9 to crop safely.
    gallery: [
      // ── AGENCY ONBOARDING ─────────────────────────────────────────────────
      {
        alt: {
          en: "VeeBot SaaS — agency onboarding wizard, step one",
          es: "VeeBot SaaS — asistente de onboarding de agencia, paso uno",
        },
        caption: {
          en: "Onboarding 01 // Agency & Subdomain",
          es: "Onboarding 01 // Agencia y Subdominio",
        },
        specs: {
          en: [
            "Step one of four names the agency and provisions its own unique subdomain",
            "An AI niche selector tunes the scoring model per vertical from sign-up",
          ],
          es: [
            "El paso uno de cuatro nombra la agencia y aprovisiona su propio subdominio único",
            "Un selector de nicho de IA ajusta el modelo de scoring por vertical desde el alta",
          ],
        },
        src: "/projects/veeBot/bot-OOB0.png",
        group: GALLERY_GROUPS.veebotOnboarding,
      },
      {
        alt: {
          en: "VeeBot SaaS — onboarding step two, portal colour design with live preview",
          es: "VeeBot SaaS — onboarding paso dos, diseño de colores del portal con vista previa en vivo",
        },
        caption: {
          en: "Onboarding 02 // Design the Portal",
          es: "Onboarding 02 // Diseñar el Portal",
        },
        specs: {
          en: [
            "Primary and accent colours are chosen at sign-up and applied across the whole agency portal",
            "A live browser preview renders the tenant's own subdomain as the colours change",
          ],
          es: [
            "Los colores principal y de acento se eligen en el alta y se aplican en todo el portal de la agencia",
            "Una vista previa de navegador en vivo renderiza el subdominio del tenant mientras cambian los colores",
          ],
        },
        src: "/projects/veeBot/bot-OOB1.png",
        group: GALLERY_GROUPS.veebotOnboarding,
        fit: "contain",
      },
      {
        alt: {
          en: "VeeBot SaaS — onboarding step three, administrator account creation",
          es: "VeeBot SaaS — onboarding paso tres, creación de la cuenta de administrador",
        },
        caption: {
          en: "Onboarding 03 // Administrator Account",
          es: "Onboarding 03 // Cuenta de Administrador",
        },
        specs: {
          en: [
            "Creates the account that holds full control over the agency's platform",
            "Full name, work email and a minimum eight-character password",
          ],
          es: [
            "Crea la cuenta que tendrá control total sobre la plataforma de la agencia",
            "Nombre completo, correo de trabajo y una contraseña de mínimo ocho caracteres",
          ],
        },
        src: "/projects/veeBot/bot-OOB2.png",
        group: GALLERY_GROUPS.veebotOnboarding,
        fit: "contain",
      },
      {
        alt: {
          en: "VeeBot SaaS — onboarding step four, launch with demo or agency licence",
          es: "VeeBot SaaS — onboarding paso cuatro, lanzamiento con demo o licencia de agencia",
        },
        caption: {
          en: "Onboarding 04 // Launch & Licence",
          es: "Onboarding 04 // Lanzamiento y Licencia",
        },
        specs: {
          en: [
            "Closes on a free demo or the PRO agency licence, billed through LemonSqueezy",
            "A summary panel confirms company, subdomain, AI niche and admin before launch",
          ],
          es: [
            "Cierra con una demo gratuita o la licencia PRO de agencia, facturada vía LemonSqueezy",
            "Un panel de resumen confirma empresa, subdominio, nicho de IA y admin antes de lanzar",
          ],
        },
        src: "/projects/veeBot/bot-OOB3.png",
        group: GALLERY_GROUPS.veebotOnboarding,
        fit: "contain",
      },
      {
        alt: {
          en: "VeeBot SaaS — split-screen sign-in for the agency portal",
          es: "VeeBot SaaS — inicio de sesión a pantalla dividida del portal de agencia",
        },
        caption: {
          en: "Access // Branded Sign-In",
          es: "Acceso // Inicio de Sesión con Marca",
        },
        specs: {
          en: [
            "Once the wizard finishes, the provisioned portal opens on its own sign-in",
            "A split-screen entry pairs the credential form with the platform's own pitch",
          ],
          es: [
            "Cuando el asistente termina, el portal aprovisionado abre en su propio inicio de sesión",
            "Una entrada a pantalla dividida combina el formulario de credenciales con la propuesta de la plataforma",
          ],
        },
        src: "/projects/veeBot/bot-login.png",
        group: GALLERY_GROUPS.veebotOnboarding,
      },

      // ── TALENT HUB ────────────────────────────────────────────────────────
      {
        alt: {
          en: "VeeBot SaaS — Talent Hub candidate dashboard with AI match scores",
          es: "VeeBot SaaS — panel de candidatos Talent Hub con puntajes de match por IA",
        },
        caption: {
          en: "Talent Hub // AI Candidate Scoring",
          es: "Talent Hub // Scoring de Candidatos con IA",
        },
        specs: {
          en: [
            "Every imported CV lands scored (92%, 88%, 85% match), with a status badge beside it",
            "Header tiles track total candidates, top talents, global quality and low-fit count",
          ],
          es: [
            "Cada CV importado llega con su puntaje (92%, 88%, 85% de match) y una insignia de estado al lado",
            "Las tarjetas del encabezado siguen candidatos totales, top talents, calidad global y bajo ajuste",
          ],
        },
        src: "/projects/veeBot/bot-dash.png",
        group: GALLERY_GROUPS.veebotTalentHub,
      },
      {
        alt: {
          en: "VeeBot SaaS — floating recruiter assistant chat over the candidate table",
          es: "VeeBot SaaS — chat flotante del asistente de reclutamiento sobre la tabla de candidatos",
        },
        caption: {
          en: "Recruiter Assistant // Natural-Language Search",
          es: "Asistente de Reclutamiento // Búsqueda en Lenguaje Natural",
        },
        specs: {
          en: [
            "A floating assistant answers open questions against the live candidate base",
            "Runs over the same table without pulling the recruiter off the dashboard",
          ],
          es: [
            "Un asistente flotante responde preguntas abiertas contra la base de candidatos en vivo",
            "Corre sobre la misma tabla sin sacar al reclutador del dashboard",
          ],
        },
        src: "/projects/veeBot/bot-chatDash-1.png",
        group: GALLERY_GROUPS.veebotTalentHub,
        fit: "contain",
      },

      // ── AI TOOLS ──────────────────────────────────────────────────────────
      {
        alt: {
          en: "VeeBot SaaS — Digital Twin AI chat interviewing a candidate twin",
          es: "VeeBot SaaS — chat de Digital Twin AI entrevistando al gemelo de un candidato",
        },
        caption: {
          en: "Digital Twin AI // Interview the Résumé",
          es: "Digital Twin AI // Entrevistar al CV",
        },
        specs: {
          en: [
            "Each processed CV becomes a conversational twin the recruiter can question directly",
            "Six twin simulations stay ready in parallel, each bound to its own candidate record",
          ],
          es: [
            "Cada CV procesado se convierte en un gemelo conversacional que el reclutador puede interrogar directamente",
            "Seis simulaciones de gemelo quedan listas en paralelo, cada una atada a su propio registro de candidato",
          ],
        },
        src: "/projects/veeBot/bot-DigitalTwins-1.png",
        group: GALLERY_GROUPS.veebotAiTools,
      },
      {
        alt: {
          en: "VeeBot SaaS — Versus AI candidate selection screen",
          es: "VeeBot SaaS — pantalla de selección de candidatos de Versus AI",
        },
        caption: {
          en: "Versus AI // Head-to-Head Setup",
          es: "Versus AI // Enfrentamiento Cara a Cara",
        },
        specs: {
          en: [
            "Any two candidates are paired for a side-by-side analysis of strengths and weaknesses",
            "Each slot carries the candidate's existing match score into the comparison",
          ],
          es: [
            "Cualquier par de candidatos se enfrenta para un análisis lado a lado de fortalezas y debilidades",
            "Cada casilla arrastra a la comparación el puntaje de match que ya tenía el candidato",
          ],
        },
        src: "/projects/veeBot/bot-comparator-1.png",
        group: GALLERY_GROUPS.veebotAiTools,
        fit: "contain",
      },
      {
        alt: {
          en: "VeeBot SaaS — Versus AI written verdict naming a suggested winner",
          es: "VeeBot SaaS — veredicto escrito de Versus AI con el ganador sugerido",
        },
        caption: {
          en: "Versus AI // The Verdict",
          es: "Versus AI // El Veredicto",
        },
        specs: {
          en: [
            "Strengths are listed per candidate, with the stronger profile flagged as the better option",
            "A written verdict names a suggested winner and explains the reasoning behind it",
          ],
          es: [
            "Las fortalezas se listan por candidato y el perfil más fuerte queda marcado como mejor opción",
            "Un veredicto escrito nombra al ganador sugerido y explica el razonamiento detrás",
          ],
        },
        src: "/projects/veeBot/bot-comparator2.png",
        group: GALLERY_GROUPS.veebotAiTools,
      },

      {
        alt: {
          en: "VeeBot SaaS — AI control panel with pipeline metrics and executive summary",
          es: "VeeBot SaaS — panel de control IA con métricas del proceso y resumen ejecutivo",
        },
        caption: {
          en: "Control Panel // Pipeline Analytics",
          es: "Panel de Control // Analíticas del Proceso",
        },
        specs: {
          en: [
            "Selection metrics across 7-day, 30-day and historical ranges",
            "An Executive AI Summary narrates the dataset in plain language, exportable as a full report",
          ],
          es: [
            "Métricas de selección en rangos de 7 días, 30 días e histórico",
            "Un Executive AI Summary narra el dataset en lenguaje claro, exportable como reporte completo",
          ],
        },
        src: "/projects/veeBot/bot-analytics1.png",
        group: GALLERY_GROUPS.veebotAiTools,
        fit: "contain",
      },
      {
        alt: {
          en: "VeeBot SaaS — quality trend curve beside a role-distribution donut",
          es: "VeeBot SaaS — curva de tendencia de calidad junto a un donut de distribución por rol",
        },
        caption: {
          en: "Quality Trend // Role Distribution",
          es: "Tendencia de Calidad // Distribución por Rol",
        },
        specs: {
          en: [
            "A quality curve tracks candidate evolution against the global average",
            "A role donut breaks the base down by speciality: Full Stack, Frontend, Backend, DevOps, Data",
          ],
          es: [
            "Una curva de calidad sigue la evolución de los candidatos contra el promedio global",
            "Un donut de roles descompone la base por especialidad: Full Stack, Frontend, Backend, DevOps, Data",
          ],
        },
        src: "/projects/veeBot/bot-analytics2.png",
        group: GALLERY_GROUPS.veebotAiTools,
      },
      {
        alt: {
          en: "VeeBot SaaS — pipeline quality bands beside a top-skills ranking",
          es: "VeeBot SaaS — bandas de calidad del pipeline junto a un ranking de habilidades top",
        },
        caption: {
          en: "Pipeline Quality // Top Skills",
          es: "Calidad del Pipeline // Habilidades Top",
        },
        specs: {
          en: [
            "Candidates bucket into low, medium and high bands against the configured match threshold",
            "A skills ranking surfaces the most in-demand technologies across the base",
          ],
          es: [
            "Los candidatos se agrupan en bandas baja, media y alta contra el umbral de match configurado",
            "Un ranking de habilidades expone las tecnologías más demandadas en la base",
          ],
        },
        src: "/projects/veeBot/bot-analytics3.png",
        group: GALLERY_GROUPS.veebotAiTools,
        fit: "contain",
      },
      {
        alt: {
          en: "VeeBot SaaS — talent export centre with Excel and JSON output",
          es: "VeeBot SaaS — centro de exportación de talento con salida a Excel y JSON",
        },
        caption: {
          en: "Data Center // Talent Export",
          es: "Data Center // Exportación de Talento",
        },
        specs: {
          en: [
            "The full talent database exports to Excel/CSV or raw JSON",
            "AES-256 encrypted, built to feed PowerBI and external ATS tools",
          ],
          es: [
            "La base de talento completa se exporta a Excel/CSV o JSON crudo",
            "Cifrada con AES-256, pensada para alimentar PowerBI y otros ATS externos",
          ],
        },
        src: "/projects/veeBot/bot-excel.png",
        group: GALLERY_GROUPS.veebotAiTools,
      },

      // ── WORKSPACE ─────────────────────────────────────────────────────────
      {
        alt: {
          en: "VeeBot SaaS — white-label branding settings with live preview",
          es: "VeeBot SaaS — configuración de marca white-label con vista previa en vivo",
        },
        caption: {
          en: "White-Label // Per-Agency Branding",
          es: "White-Label // Marca por Agencia",
        },
        specs: {
          en: [
            "Primary and accent colours configured per tenant against a live component preview",
            "Profile details and plan tier sit in the same settings panel",
          ],
          es: [
            "Colores principal y de acento configurados por tenant contra una vista previa de componentes en vivo",
            "Los datos de perfil y el plan viven en el mismo panel de configuración",
          ],
        },
        src: "/projects/veeBot/bot-settings-1.png",
        group: GALLERY_GROUPS.veebotWorkspace,
        fit: "contain",
      },
      {
        alt: {
          en: "VeeBot SaaS — Agency Pro subscription panel",
          es: "VeeBot SaaS — panel de suscripción Agency Pro",
        },
        caption: {
          en: "Subscription // Agency Pro Plan",
          es: "Suscripción // Plan Agency Pro",
        },
        specs: {
          en: [
            "The active plan and its auto-renewal state, managed from inside the product",
            "Unlimited analysis, Llama 3.3 chat, CSV/JSON export and 24/7 VIP support",
          ],
          es: [
            "El plan activo y su renovación automática, gestionados desde dentro del producto",
            "Análisis ilimitado, chat con Llama 3.3, exportación CSV/JSON y soporte VIP 24/7",
          ],
        },
        src: "/projects/veeBot/bot-settings1.png",
        group: GALLERY_GROUPS.veebotWorkspace,
        fit: "contain",
      },
      {
        alt: {
          en: "VeeBot SaaS — AI configuration with match threshold and demo mode",
          es: "VeeBot SaaS — configuración de IA con umbral de coincidencia y modo demostración",
        },
        caption: {
          en: "AI Settings // Threshold & Demo Mode",
          es: "Ajustes de IA // Umbral y Modo Demo",
        },
        specs: {
          en: [
            "A match-threshold slider sets the minimum score that earns a high-potential badge",
            "Smart auto-reject archives candidates below technical requirements; demo mode seeds sample data",
          ],
          es: [
            "Un slider de umbral define el score mínimo que otorga la insignia de alto potencial",
            "El auto-rechazo inteligente archiva candidatos bajo los requisitos técnicos; el modo demo carga datos de prueba",
          ],
        },
        src: "/projects/veeBot/bot-settings3.png",
        group: GALLERY_GROUPS.veebotWorkspace,
        fit: "contain",
      },
      {
        alt: {
          en: "VeeBot SaaS — account security panel with password change and deletion",
          es: "VeeBot SaaS — panel de seguridad de la cuenta con cambio de contraseña y eliminación",
        },
        caption: {
          en: "Security // Credentials & Account Deletion",
          es: "Seguridad // Credenciales y Eliminación de Cuenta",
        },
        specs: {
          en: [
            "Password rotation guarded by an explicit strength requirement",
            "Account deletion is isolated in its own destructive zone with an irreversibility warning",
          ],
          es: [
            "Rotación de contraseña protegida por un requisito explícito de fortaleza",
            "La eliminación de cuenta queda aislada en su propia zona destructiva con aviso de irreversibilidad",
          ],
        },
        src: "/projects/veeBot/bot-settings2.png",
        group: GALLERY_GROUPS.veebotWorkspace,
      },

      // ── SUPPORT & HELP ────────────────────────────────────────────────────
      {
        alt: {
          en: "VeeBot SaaS — searchable knowledge base with category filters",
          es: "VeeBot SaaS — base de conocimiento con búsqueda y filtros por categoría",
        },
        caption: {
          en: "Knowledge Base // Searchable Help Centre",
          es: "Base de Conocimiento // Centro de Ayuda con Búsqueda",
        },
        specs: {
          en: [
            "A searchable help centre answering questions about capabilities, AI and exports",
            "Entries filter by category: capabilities, interviews, data and security",
          ],
          es: [
            "Un centro de ayuda con búsqueda que responde sobre capacidades, IA y exportación",
            "Las entradas se filtran por categoría: capacidades, entrevistas, datos y seguridad",
          ],
        },
        src: "/projects/veeBot/bot-help-1.png",
        group: GALLERY_GROUPS.veebotSupport,
        fit: "contain",
      },
      {
        alt: {
          en: "VeeBot SaaS — support contact form with direct email channel",
          es: "VeeBot SaaS — formulario de contacto de soporte con canal de email directo",
        },
        caption: {
          en: "Support // Direct Contact Channel",
          es: "Soporte // Canal de Contacto Directo",
        },
        specs: {
          en: [
            "A contact form for plan questions and custom integrations, with a stated response window",
            "A direct email channel sits beside it for anything outside the form",
          ],
          es: [
            "Un formulario de contacto para consultas de plan e integraciones a medida, con tiempo de respuesta declarado",
            "Un canal de email directo queda al lado para lo que no entre en el formulario",
          ],
        },
        src: "/projects/veeBot/bot-suport-1.png",
        group: GALLERY_GROUPS.veebotSupport,
        fit: "contain",
      },
    ],
  },
  {
    id: "estudio-zanacchi",
    index: "03",
    title: "Estudio Zanacchi",
    status: "PROD",
    statusLabel: STATUS_LABELS.production,
    architecture: { en: "SPA / CSR", es: "SPA / CSR" },
    stack: ["React", "Vite", "Tailwind", "Framer Motion", "Google Maps API", "WhatsApp API"],
    location: { en: "VERCEL EDGE // GLOBAL CDN", es: "VERCEL EDGE // CDN GLOBAL" },
    latency: { en: "0.29ms", es: "0.29ms" },
    icon: FiGlobe,
    heroImage: "/projects/estudio/estudio-back.png",
    scope: {
      en: "A high-performance marketing and client-intake site for a criminal and consumer-law practice, built as a React/Vite SPA with an aggressive editorial brand identity, WhatsApp-routed case intake, and Google Maps–located offices across two provinces.",
      es: "Un sitio institucional y de captación de clientes de alto rendimiento para un estudio de derecho penal y del consumidor, construido como una SPA en React/Vite con una identidad editorial agresiva, recepción de casos derivada a WhatsApp y sedes ubicadas con Google Maps en dos provincias.",
    },
    challenge: {
      en: "Every case intake is time-sensitive and personal. The contact flow has to route a stranger's legal problem straight into WhatsApp without ever feeling like a generic contact form.",
      es: "Cada recepción de caso es sensible al tiempo y personal. El flujo de contacto tiene que derivar el problema legal de un desconocido directo a WhatsApp sin sentirse nunca como un formulario de contacto genérico.",
    },
    objectives: {
      en: [
        "Ship a fast, SEO-ready marketing site as a React/Vite SPA",
        "Route every case intake straight to WhatsApp via a structured, pre-categorised form",
        "Pin both office locations, Tucumán and Catamarca, with Google Maps",
        "Hit 100/100 Lighthouse performance on every core route",
      ],
      es: [
        "Publicar un sitio institucional rápido y listo para SEO como SPA en React/Vite",
        "Derivar cada recepción de caso directo a WhatsApp mediante un formulario estructurado y pre-categorizado",
        "Ubicar ambas sedes, Tucumán y Catamarca, con Google Maps",
        "Alcanzar 100/100 de rendimiento en Lighthouse en cada ruta principal",
      ],
    },
    gallery: [
      // ── LANDING & BRAND ─────────────────────────────────────────────────
      {
        alt: {
          en: "Estudio Zanacchi — hero landing page with credential stats",
          es: "Estudio Zanacchi — landing hero con estadísticas de credenciales",
        },
        caption: {
          en: "Hero // Brand & Credentials",
          es: "Hero // Marca y Credenciales",
        },
        specs: {
          en: [
            "Full-bleed hero with serif display type and a 90% success-rate credential badge",
            "Dual CTA layout: instant WhatsApp consultation and services deep-link",
          ],
          es: [
            "Hero a sangre completa con tipografía serif display y badge de 90% de éxito",
            "Doble CTA: consulta instantánea por WhatsApp y enlace a servicios",
          ],
        },
        src: "/projects/estudio/estudio-back.png",
        group: GALLERY_GROUPS.estudioLanding,
      },
      {
        alt: {
          en: "Estudio Zanacchi — founding team section with Vanessa Zanacchi bio",
          es: "Estudio Zanacchi — sección del equipo fundador con bio de Vanessa Zanacchi",
        },
        caption: {
          en: "Team // Founding Partner Profile",
          es: "Equipo // Perfil de Socia Fundadora",
        },
        specs: {
          en: [
            "Editorial split-layout with photo and professional milestones of the founding partner",
            "Italic serif headings reinforce the law firm's premium identity across every section",
          ],
          es: [
            "Layout editorial dividido con foto e hitos profesionales de la socia fundadora",
            "Encabezados en serif itálica refuerzan la identidad premium del estudio en cada sección",
          ],
        },
        src: "/projects/estudio/estudio-about.png",
        group: GALLERY_GROUPS.estudioLanding,
      },

      // ── PRACTICE AREAS ──────────────────────────────────────────────────
      {
        alt: {
          en: "Estudio Zanacchi — practice areas grid with three speciality cards",
          es: "Estudio Zanacchi — grilla de áreas de práctica con tres tarjetas de especialidad",
        },
        caption: {
          en: "Services // Areas of Practice",
          es: "Servicios // Áreas de Práctica",
        },
        specs: {
          en: [
            "Three speciality cards, Consumer Law, Criminal & Complaints, and Gender Violence, each with domain photography",
            "Central CTA button drives to the contact intake form from any practice card",
          ],
          es: [
            "Tres tarjetas de especialidad, Derecho del Consumidor, Penal y Querellas, Violencia de Género, cada una con fotografía del área",
            "CTA central dirige al formulario de contacto desde cualquier tarjeta de práctica",
          ],
        },
        src: "/projects/estudio/estudio-areas.png",
        group: GALLERY_GROUPS.estudioPractice,
      },

      // ── TESTIMONIALS & METHOD ───────────────────────────────────────────
      {
        alt: {
          en: "Estudio Zanacchi — client testimonials section with three quote cards",
          es: "Estudio Zanacchi — sección de testimonios con tres tarjetas de citas",
        },
        caption: {
          en: "Social Proof // Client Testimonials",
          es: "Prueba Social // Testimonios de Clientes",
        },
        specs: {
          en: [
            "Three testimonial cards from real clients: criminal complaint, gender violence, and animal rights cases",
            "Each card carries the client's initials, case category badge, and a decorative quote mark",
          ],
          es: [
            "Tres tarjetas de testimonios de clientes reales: querella penal, violencia de género y derecho animal",
            "Cada tarjeta lleva iniciales del cliente, badge de categoría del caso y comilla decorativa",
          ],
        },
        src: "/projects/estudio/estudio-reseñas.png",
        group: GALLERY_GROUPS.estudioSocialProof,
      },
      {
        alt: {
          en: "Estudio Zanacchi — methodology timeline with four workflow stages",
          es: "Estudio Zanacchi — línea de tiempo del método con cuatro etapas del flujo",
        },
        caption: {
          en: "Workflow // The Zanacchi Method",
          es: "Workflow // El Método Zanacchi",
        },
        specs: {
          en: [
            "A vertical timeline maps the four-stage legal workflow: Forensic Analysis, Shock Strategy, Litigation & Negotiation, Resolution",
            "Each node carries a pink accent dot and brief explanation, reinforcing the firm's aggressive strategy brand",
          ],
          es: [
            "Una línea de tiempo vertical mapea el flujo legal de cuatro etapas: Análisis Forense, Estrategia de Choque, Litigio y Negociación, Resolución",
            "Cada nodo lleva un punto de acento rosa con explicación breve, reforzando la marca de estrategia agresiva del estudio",
          ],
        },
        src: "/projects/estudio/estudio-pipline.png",
        group: GALLERY_GROUPS.estudioSocialProof,
      },

      // ── NEWS & MEDIA ────────────────────────────────────────────────────
      {
        alt: {
          en: "Estudio Zanacchi — news listing page with media recognition logos",
          es: "Estudio Zanacchi — página de noticias con logos de reconocimiento en medios",
        },
        caption: {
          en: "Press // Media Recognition & Articles",
          es: "Prensa // Reconocimiento en Medios y Artículos",
        },
        specs: {
          en: [
            "Media banner showcases coverage by El Tucumano and La Gaceta, the province's two leading newspapers",
            "Three article cards with category badges (Animal Rights, Criminal), read-time estimate, and external links",
          ],
          es: [
            "Banner de medios destaca cobertura de El Tucumano y La Gaceta, los dos principales diarios de la provincia",
            "Tres tarjetas de artículo con badges de categoría (Derecho Animal, Penal), tiempo de lectura y enlaces externos",
          ],
        },
        src: "/projects/estudio/estudio-noticias.png",
        group: GALLERY_GROUPS.estudioNews,
      },
      {
        alt: {
          en: "Estudio Zanacchi — landmark article hero, animal cruelty conviction",
          es: "Estudio Zanacchi — hero de artículo emblemático, condena por crueldad animal",
        },
        caption: {
          en: "Article // Landmark Conviction Hero",
          es: "Artículo // Hero de Fallo Histórico",
        },
        specs: {
          en: [
            "Full-viewport hero for the landmark case article with cinematic background imagery and jurisprudence category tag",
            "Publication date and read-time metadata anchored below the headline in monospace",
          ],
          es: [
            "Hero a pantalla completa para el artículo del caso emblemático con imagen de fondo cinematográfica y tag de jurisprudencia",
            "Fecha de publicación y tiempo de lectura anclados debajo del titular en monospace",
          ],
        },
        src: "/projects/estudio/estudio-news-1.png",
        group: GALLERY_GROUPS.estudioNews,
      },
      {
        alt: {
          en: "Estudio Zanacchi — article body with case analysis and sidebar",
          es: "Estudio Zanacchi — cuerpo del artículo con análisis del caso y sidebar",
        },
        caption: {
          en: "Article // Case Analysis & Legal Context",
          es: "Artículo // Análisis del Caso y Contexto Legal",
        },
        specs: {
          en: [
            "Long-form editorial body with a sidebar card for the legal resolution and a studio credit block",
            "Serif italic pull-quotes break the narrative with high-impact statements from the ruling",
          ],
          es: [
            "Cuerpo editorial de largo formato con tarjeta lateral de resolución legal y bloque de crédito del estudio",
            "Pull-quotes en serif itálica rompen la narrativa con declaraciones de alto impacto del fallo",
          ],
        },
        src: "/projects/estudio/estudio-news-2.png",
        group: GALLERY_GROUPS.estudioNews,
      },
      {
        alt: {
          en: "Estudio Zanacchi — judicial quote blockquote from the presiding judge",
          es: "Estudio Zanacchi — cita judicial en blockquote de la jueza del caso",
        },
        caption: {
          en: "Article // Judicial Quote",
          es: "Artículo // Cita Judicial",
        },
        specs: {
          en: [
            "Full-width blockquote with a vertical pink accent bar, citing the presiding judge on the inadequacy of current animal protection laws",
            "Attribution line uses spaced-uppercase monospace for gravitas",
          ],
          es: [
            "Blockquote a ancho completo con barra de acento rosa vertical, citando a la jueza sobre la insuficiencia de las leyes de protección animal",
            "La línea de atribución usa monospace en mayúsculas espaciadas para dar gravedad",
          ],
        },
        src: "/projects/estudio/estudio-news-3.png",
        group: GALLERY_GROUPS.estudioNews,
        fit: "contain",
      },
      {
        alt: {
          en: "Estudio Zanacchi — case chronology timeline with alternating cards",
          es: "Estudio Zanacchi — cronología del caso con tarjetas alternadas",
        },
        caption: {
          en: "Article // Case Chronology",
          es: "Artículo // Cronología del Caso",
        },
        specs: {
          en: [
            "Alternating-side timeline cards trace the case from initial discovery through preventive detention to trial",
            "Pink accent dots on the central axis mark each milestone; the final 'Pedido al Congreso' card glows with an emphasized border",
          ],
          es: [
            "Tarjetas alternadas en la línea de tiempo trazan el caso desde el descubrimiento hasta la detención preventiva y el juicio",
            "Puntos de acento rosa en el eje central marcan cada hito; la tarjeta final 'Pedido al Congreso' brilla con borde enfatizado",
          ],
        },
        src: "/projects/estudio/estudio-news-4.png",
        group: GALLERY_GROUPS.estudioNews,
      },
      {
        alt: {
          en: "Estudio Zanacchi — chronology conclusion, plea to Congress",
          es: "Estudio Zanacchi — conclusión de cronología, pedido al Congreso",
        },
        caption: {
          en: "Article // Verdict & Legislative Push",
          es: "Artículo // Veredicto y Empuje Legislativo",
        },
        specs: {
          en: [
            "Final timeline nodes show the abbreviated trial verdict and the formal request to Congress to amend Law 14.346",
            "The last card's glowing pink border signals the case's lasting policy impact beyond the courtroom",
          ],
          es: [
            "Los últimos nodos de la línea de tiempo muestran el veredicto del juicio abreviado y el pedido formal al Congreso de modificar la Ley 14.346",
            "El borde rosa brillante de la última tarjeta señala el impacto político duradero del caso más allá del tribunal",
          ],
        },
        src: "/projects/estudio/estudio-news-5.png",
        group: GALLERY_GROUPS.estudioNews,
        fit: "contain",
      },

      // ── CONTACT & INTAKE ────────────────────────────────────────────────
      {
        alt: {
          en: "Estudio Zanacchi — contact page with office locations and case intake form",
          es: "Estudio Zanacchi — página de contacto con sedes y formulario de inicio de caso",
        },
        caption: {
          en: "Contact // Office Locations & Case Intake",
          es: "Contacto // Sedes y Recepción de Casos",
        },
        specs: {
          en: [
            "Split layout: left panel shows office addresses with WhatsApp and live availability status, right panel opens the case intake form",
            "Conflict-type selector chips (Criminal, Emergencies, Family, Succession, Damages) pre-route the case before submission",
          ],
          es: [
            "Layout dividido: panel izquierdo muestra direcciones de sedes con WhatsApp y estado de disponibilidad en vivo, panel derecho abre el formulario de caso",
            "Chips de tipo de conflicto (Penal, Urgencias, Familia, Sucesiones, Daños) pre-rutean el caso antes del envío",
          ],
        },
        src: "/projects/estudio/estudio-contacto-1.png",
        group: GALLERY_GROUPS.estudioContact,
      },
      {
        alt: {
          en: "Estudio Zanacchi — case intake form with WhatsApp secure submission",
          es: "Estudio Zanacchi — formulario de caso con envío seguro por WhatsApp",
        },
        caption: {
          en: "Intake // Secure WhatsApp Submission",
          es: "Intake // Envío Seguro por WhatsApp",
        },
        specs: {
          en: [
            "Complete case form with name, optional email, conflict category chips, and free-text description field",
            "A full-width green 'Iniciar Chat Seguro' CTA routes the structured message directly to the attorney's WhatsApp via the WAPI integration",
          ],
          es: [
            "Formulario completo con nombre, email opcional, chips de categoría de conflicto y campo de descripción libre",
            "Un CTA verde a ancho completo 'Iniciar Chat Seguro' envía el mensaje estructurado directo al WhatsApp del abogado vía la integración WAPI",
          ],
        },
        src: "/projects/estudio/estudio-contacto-2.png",
        group: GALLERY_GROUPS.estudioContact,
        fit: "contain",
      },
    ],
    liveUrl: "https://www.estudiozanacchi.com",
  },
  {
    id: "portafolio-mel",
    index: "04",
    title: "Portafolio Mel",
    status: "DEV",
    statusLabel: STATUS_LABELS.inDevelopment,
    architecture: { en: "SPA / CSR", es: "SPA / CSR" },
    stack: ["React", "Vite", "TypeScript", "Tailwind", "Framer Motion", "Google Maps API", "WhatsApp API"],
    location: { en: "PREVIEW BUILD // DEV", es: "BUILD DE PREVIEW // DEV" },
    latency: { en: "6.1ms (staging)", es: "6.1ms (staging)" },
    icon: FiLayout,
    heroImage: "/projects/portafolio-mel/portafolio-back.png",
    scope: {
      en: "A kinetic, image-forward photography portfolio built as a TypeScript React/Vite SPA, showcasing creative work with fluid Framer Motion transitions and a distinct visual identity.",
      es: "Un portfolio de fotografía cinético y centrado en la imagen, construido como una SPA en React/Vite con TypeScript, que exhibe trabajo creativo con transiciones fluidas de Framer Motion y una identidad visual propia.",
    },
    challenge: {
      en: "Full-bleed imagery and layered motion transitions are heavy by default. The build has to stay buttery on mid-range mobile hardware, not just on a dev machine.",
      es: "Las imágenes a sangre completa y las transiciones en capas son pesadas por naturaleza. El build tiene que seguir siendo fluido en hardware móvil de gama media, no solo en una máquina de desarrollo.",
    },
    objectives: {
      en: [
        "Build a fast, gallery-first layout for visual work",
        "Add fluid Framer Motion page/section transitions",
        "Keep the CMS-free content model simple enough to update solo",
        "Route booking enquiries to WhatsApp and locate shoots with Google Maps",
      ],
      es: [
        "Construir un layout rápido y centrado en la galería para trabajo visual",
        "Sumar transiciones fluidas de página y sección con Framer Motion",
        "Mantener el modelo de contenido sin CMS simple de actualizar en solitario",
        "Derivar consultas de reserva a WhatsApp y ubicar sesiones con Google Maps",
      ],
    },
    gallery: [
      // ── LANDING & HERO ────────────────────────────────────────────────
      {
        alt: {
          en: "Melina Zanacchi Portfolio — landing hero section with parallax images",
          es: "Portafolio Melina Zanacchi — sección hero con imágenes en parallax",
        },
        caption: {
          en: "Landing // Kinetic Hero",
          es: "Landing // Hero Cinético",
        },
        specs: {
          en: ["Full-bleed typography layered with drifting, parallax-driven photography", "Smooth load-in orchestration via Framer Motion"],
          es: ["Tipografía a sangre completa en capas con fotografía en parallax a la deriva", "Orquestación de carga suave a través de Framer Motion"],
        },
        src: "/projects/portafolio-mel/portafolio-back.png",
        group: GALLERY_GROUPS.portafolioMelLanding,
      },
      // ── GALLERIES & WORK ────────────────────────────────────────────────
      {
        alt: {
          en: "Melina Zanacchi Portfolio — interactive hover slider",
          es: "Portafolio Melina Zanacchi — slider interactivo hover",
        },
        caption: {
          en: "Galleries // Hover Expansion Slider",
          es: "Galerías // Slider de Expansión Hover",
        },
        specs: {
          en: [
            "Five labelled columns, Editorial, Fine Art, Portraiture, Cinematic, Monochrome, expand fluidly on hover",
            "The active column widens to reveal its full photograph while the rest compress to a labelled sliver",
          ],
          es: [
            "Cinco columnas etiquetadas, Editorial, Fine Art, Retratos, Cinemático, Monocromo, se expanden fluidamente al hacer hover",
            "La columna activa se ensancha para revelar la foto completa mientras el resto se comprime a una franja con etiqueta",
          ],
        },
        src: "/projects/portafolio-mel/portafolio-hoverSlider.png",
        group: GALLERY_GROUPS.portafolioMelGallery,
      },
      {
        alt: {
          en: "Melina Zanacchi Portfolio — stacked phase cards",
          es: "Portafolio Melina Zanacchi — tarjetas de fases apiladas",
        },
        caption: {
          en: "Process // Stacked Phase Cards",
          es: "Proceso // Tarjetas de Fases Apiladas",
        },
        specs: {
          en: [
            "Numbered phase cards ('Phase 2 — 02/03', 'Phase 3 — 03/03') stack on scroll, each stamped with its own progress counter",
            "The final card, 'The Polish', details the high-end retouching stage: color grading, dodging and burning, while protecting natural authenticity",
          ],
          es: [
            "Tarjetas de fase numeradas ('Fase 2 — 02/03', 'Fase 3 — 03/03') se apilan al scrollear, cada una con su propio contador de progreso",
            "La tarjeta final, 'The Polish', detalla la etapa de retoque de alta gama: corrección de color, dodge y burn, protegiendo la autenticidad natural",
          ],
        },
        src: "/projects/portafolio-mel/portafolio-cards.png",
        group: GALLERY_GROUPS.portafolioMelGallery,
      },
      {
        alt: {
          en: "Melina Zanacchi Portfolio — circular gallery of thumbnails around 'The Art of Perception' heading",
          es: "Portafolio Melina Zanacchi — galería circular de miniaturas alrededor del título 'The Art of Perception'",
        },
        caption: {
          en: "Gallery // The Art of Perception",
          es: "Galería // The Art of Perception",
        },
        specs: {
          en: [
            "Roughly twenty photographs arranged in a full circle around a centred headline and 'scroll to explore' cue",
            "Scroll-driven entrance brings each thumbnail in from the ring's edge toward its resting position",
          ],
          es: [
            "Alrededor de veinte fotografías dispuestas en un círculo completo alrededor de un título centrado y la indicación 'scroll to explore'",
            "La entrada impulsada por scroll trae cada miniatura desde el borde del anillo hasta su posición final",
          ],
        },
        src: "/projects/portafolio-mel/portafolio-carousel-1.png",
        group: GALLERY_GROUPS.portafolioMelGallery,
      },
      {
        alt: {
          en: "Melina Zanacchi Portfolio — 'Curated Masterpieces' section with a tilted photo strip",
          es: "Portafolio Melina Zanacchi — sección 'Curated Masterpieces' con tira de fotos inclinadas",
        },
        caption: {
          en: "Gallery // Curated Masterpieces",
          es: "Galería // Curated Masterpieces",
        },
        specs: {
          en: [
            "A row of alternating tilted thumbnails runs along the bottom edge beneath the section headline",
            "Companion section to the circular gallery above, reusing the same card style in a straight line",
          ],
          es: [
            "Una fila de miniaturas inclinadas alternadas corre a lo largo del borde inferior debajo del título de sección",
            "Sección hermana de la galería circular anterior, reutilizando el mismo estilo de tarjeta en línea recta",
          ],
        },
        src: "/projects/portafolio-mel/portafolio-carousel-2.png",
        group: GALLERY_GROUPS.portafolioMelGallery,
      },
      // ── ABOUT & APPROACH ────────────────────────────────────────────────
      {
        alt: {
          en: "Melina Zanacchi Portfolio — about and artist direction",
          es: "Portafolio Melina Zanacchi — sobre mí y dirección artística",
        },
        caption: {
          en: "About // Artist & Direction",
          es: "Sobre mí // Artista y Dirección",
        },
        specs: {
          en: ["Clean editorial typography balancing negative space and structural photography", "Grid-aligned content blocks with statistical highlights"],
          es: ["Tipografía editorial limpia equilibrando el espacio negativo y la fotografía estructural", "Bloques de contenido alineados a grilla con destacados estadísticos"],
        },
        src: "/projects/portafolio-mel/portafolio-about.png",
        group: GALLERY_GROUPS.portafolioMelAbout,
      },
      {
        alt: {
          en: "Melina Zanacchi Portfolio — about section alternative layout",
          es: "Portafolio Melina Zanacchi — layout alternativo de sección sobre mí",
        },
        caption: {
          en: "About // Philosophy & Stats",
          es: "Sobre mí // Filosofía y Estadísticas",
        },
        specs: {
          en: ["Dark-themed split-panel layout featuring a striking portrait and professional philosophy", "Embedded metric highlights showcasing editorial excellence"],
          es: ["Layout de panel dividido con temática oscura presentando un retrato impactante y filosofía profesional", "Destacados métricos incrustados que muestran la excelencia editorial"],
        },
        src: "/projects/portafolio-mel/portafolio-about-2.png",
        group: GALLERY_GROUPS.portafolioMelAbout,
      },
      {
        alt: {
          en: "Melina Zanacchi Portfolio — three pillars of photographic excellence",
          es: "Portafolio Melina Zanacchi — tres pilares de excelencia fotográfica",
        },
        caption: {
          en: "Approach // The Three Pillars",
          es: "Enfoque // Los Tres Pilares",
        },
        specs: {
          en: [
            "Three numbered pillars, Environmental Synergy, Editorial Retouching, Tailored Direction, each paired with its own photograph",
            "Frames the methodology as reading light and location, retouching with restraint, and directing subjects with intuitive precision",
          ],
          es: [
            "Tres pilares numerados, Sinergia Ambiental, Retoque Editorial, Dirección a Medida, cada uno emparejado con su propia fotografía",
            "Presenta la metodología como leer la luz y el lugar, retocar con mesura y dirigir sujetos con precisión intuitiva",
          ],
        },
        src: "/projects/portafolio-mel/portafolio-info.png",
        group: GALLERY_GROUPS.portafolioMelAbout,
      },
      // ── CONTACT & BOOKING ────────────────────────────────────────────────
      {
        alt: {
          en: "Melina Zanacchi Portfolio — contact and booking form",
          es: "Portafolio Melina Zanacchi — formulario de contacto y reserva",
        },
        caption: {
          en: "Contact // Booking Experience",
          es: "Contacto // Experiencia de Reserva",
        },
        specs: {
          en: ["Minimalist inquiry form with dropdown selections for project types", "Stark contrast design driving focus entirely to the conversion action"],
          es: ["Formulario de consulta minimalista con selecciones desplegables para tipos de proyecto", "Diseño de alto contraste que dirige el enfoque completamente a la acción de conversión"],
        },
        src: "/projects/portafolio-mel/portafolio-contact-1.png",
        group: GALLERY_GROUPS.portafolioMelContact,
      },
    ],
  },
  {
    id: "consultorio-odontologico",
    index: "05",
    title: "Consultorio Odontológico",
    status: "DEV",
    statusLabel: STATUS_LABELS.inDevelopment,
    architecture: { en: "SPA / CSR", es: "SPA / CSR" },
    stack: ["React", "Vite", "Tailwind", "Framer Motion", "Google Maps API", "WhatsApp API"],
    location: { en: "STATIC HOSTING // DEV", es: "HOSTING ESTÁTICO // DEV" },
    latency: { en: "8.4ms (staging)", es: "8.4ms (staging)" },
    icon: FiCalendar,
    heroImage: "/projects/consultorio/consul-back.png",
    scope: {
      en: "A marketing and patient-acquisition site for a dental practice specializing in high-complexity treatments, showcasing services, 3D/iTero scanning technology, and doctor credentials, with every enquiry routed straight to an encrypted WhatsApp chat.",
      es: "Un sitio de marketing y captación de pacientes para un consultorio odontológico especializado en tratamientos de alta complejidad, mostrando servicios, tecnología de escaneo 3D/iTero y las credenciales de la doctora, con cada consulta derivada directo a un chat de WhatsApp encriptado.",
    },
    challenge: {
      en: "A prospective patient's first move is almost always WhatsApp, not a phone call or a generic form. The site has to turn browsing into a pre-qualified WhatsApp conversation without losing the clinic's clinical, trustworthy tone.",
      es: "El primer movimiento de un paciente potencial es casi siempre WhatsApp, no una llamada ni un formulario genérico. El sitio tiene que convertir la navegación en una conversación de WhatsApp pre-calificada sin perder el tono clínico y confiable del consultorio.",
    },
    objectives: {
      en: [
        "Present high-complexity treatments, aesthetic dentistry, laser whitening, advanced implantology, invisible orthodontics, with real clinical detail",
        "Route every enquiry straight to WhatsApp with the treatment of interest pre-filled",
        "Locate the practice with Google Maps and keep contact details reachable from every section",
      ],
      es: [
        "Presentar tratamientos de alta complejidad, odontología estética, aclaramiento láser, implantología avanzada, ortodoncia invisible, con detalle clínico real",
        "Derivar cada consulta directo a WhatsApp con el tratamiento de interés precargado",
        "Ubicar el consultorio con Google Maps y mantener los datos de contacto accesibles desde cualquier sección",
      ],
    },
    // Real product screenshots — public/projects/consultorio/. Captions describe
    // what is actually on each screen, written from the images directly.
    gallery: [
      {
        alt: {
          en: "Consultorio Odontológico — hero landing page with credential stats and patient review",
          es: "Consultorio Odontológico — landing hero con estadísticas de credenciales y reseña de paciente",
        },
        caption: {
          en: "Hero // Digital Precision & Trust",
          es: "Hero // Precisión Digital y Confianza",
        },
        specs: {
          en: [
            "Dual CTA layout: direct appointment booking and a deep-link into treatments",
            "Five-star patient review and a '3D Scanner — Zero Impressions' badge overlay a real scan photo",
          ],
          es: [
            "Doble CTA: turno directo y enlace a tratamientos",
            "Reseña de paciente de cinco estrellas e insignia 'Escáner 3D — Cero Impresiones' sobre una foto real de escaneo",
          ],
        },
        src: "/projects/consultorio/consul-back.png",
      },
      {
        alt: {
          en: "Consultorio Odontológico — doctor profile with credentials and chairside photo",
          es: "Consultorio Odontológico — perfil de la doctora con credenciales y foto en consultorio",
        },
        caption: {
          en: "About // Doctor Profile & Credentials",
          es: "Sobre Mí // Perfil y Credenciales",
        },
        specs: {
          en: [
            "Clinical direction badge paired with a chairside consultation photo",
            "Four-point checklist: 3D planning, minimally invasive care, biocompatible materials, comfort-first environment",
          ],
          es: [
            "Insignia de dirección clínica junto a una foto de consulta en el consultorio",
            "Checklist de cuatro puntos: planificación 3D, odontología mínimamente invasiva, materiales biocompatibles, entorno de confort",
          ],
        },
        src: "/projects/consultorio/consul-about.png",
      },
      {
        alt: {
          en: "Consultorio Odontológico — high-complexity treatments grid",
          es: "Consultorio Odontológico — grilla de tratamientos de alta complejidad",
        },
        caption: {
          en: "Services // High-Complexity Treatments",
          es: "Servicios // Tratamientos de Alta Complejidad",
        },
        specs: {
          en: [
            "Three specialty cards, Aesthetic Dentistry, Laser Whitening, Advanced Implantology, each carrying its own badge (Alta Demanda, 1 Sesión, Precisión 3D)",
            "Every card opens into its own detail view via a consistent 'Ver Detalles' pattern",
          ],
          es: [
            "Tres tarjetas de especialidad, Odontología Estética, Aclaramiento Láser, Implantología Avanzada, cada una con su propia insignia (Alta Demanda, 1 Sesión, Precisión 3D)",
            "Cada tarjeta abre su propia vista de detalle con el mismo patrón 'Ver Detalles'",
          ],
        },
        src: "/projects/consultorio/consul-tratamientos.png",
      },
      {
        alt: {
          en: "Consultorio Odontológico — invisible orthodontics treatment page with iTero scanner and phase tracker",
          es: "Consultorio Odontológico — página de ortodoncia invisible con escáner iTero y seguimiento de fases",
        },
        caption: {
          en: "Invisible Orthodontics // Scan & Phase Tracking",
          es: "Ortodoncia Invisible // Escaneo y Seguimiento de Fases",
        },
        specs: {
          en: [
            "iTero 5D Plus scan visual paired with a live 'Phase 2/14' aligner-progress card",
            "Three feature blocks: near-invisible aesthetics, predictive 3D planning, wire-free comfort",
          ],
          es: [
            "Visual de escaneo iTero 5D Plus junto a una tarjeta de progreso 'Fase 2/14' del alineador",
            "Tres bloques de características: estética prácticamente invisible, planificación 3D predictiva, confort sin alambres",
          ],
        },
        src: "/projects/consultorio/consul-ortInvisible.png",
      },
      {
        alt: {
          en: "Consultorio Odontológico — WhatsApp-routed contact and booking form",
          es: "Consultorio Odontológico — formulario de contacto y turnos derivado a WhatsApp",
        },
        caption: {
          en: "Contact // Encrypted WhatsApp Booking",
          es: "Contacto // Turnos Encriptados por WhatsApp",
        },
        specs: {
          en: [
            "Name, treatment of interest, and optional notes route straight to an encrypted WhatsApp handoff",
            "Clinic info panel carries address, direct phone line, and office hours alongside the form",
          ],
          es: [
            "Nombre, tratamiento de interés y notas opcionales derivan directo a un handoff encriptado por WhatsApp",
            "El panel de información clínica lleva dirección, línea telefónica directa y horario junto al formulario",
          ],
        },
        src: "/projects/consultorio/consul-contact.png",
      },
      {
        alt: {
          en: "Consultorio Odontológico — site footer with quick links, specialties, and contact block",
          es: "Consultorio Odontológico — pie de página con enlaces rápidos, especialidades y bloque de contacto",
        },
        caption: {
          en: "Footer // Sitemap & Contact Block",
          es: "Footer // Mapa del Sitio y Bloque de Contacto",
        },
        specs: {
          en: [
            "Four-column layout: practice card, quick links, specialties list, and contact details with social icons",
            "Address, phone, and email repeated here so booking info is reachable from anywhere on the site",
          ],
          es: [
            "Layout de cuatro columnas: tarjeta del consultorio, enlaces rápidos, lista de especialidades y contacto con íconos sociales",
            "Dirección, teléfono y email repetidos aquí para que la información de turnos esté a mano desde cualquier parte del sitio",
          ],
        },
        src: "/projects/consultorio/consul-footer.png",
        // ~2.4:1 — well past 16:9. object-cover would crop roughly 13% off
        // each side, straight into the outer columns (practice card, contact
        // block). Letterbox instead so the full four-column layout survives.
        fit: "contain",
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
      group: image.group && { id: image.group.id, label: image.group.label[locale] },
      fit: image.fit,
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
