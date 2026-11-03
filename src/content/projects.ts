import { PROJECTS_DATA } from "@/data/projects";
import type { Localized, ProjectContent, ShowcaseShot } from "@/types/content";

/**
 * The 5 real projects, as the new content layer exposes them.
 *
 * Reuses `PROJECTS_DATA` (the legacy data file's *values*, not its type) for
 * every field that already existed — id, title, status, architecture, stack,
 * scope, challenge, objectives, the full 52-screenshot gallery, liveUrl — so
 * nothing is duplicated and nothing drifts. `latency` is dropped on the way
 * out (plan finding A2 — no fabricated metric). `solution` and `showcase`
 * are new: both ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `this.SHOTS`, line 367, and the
 * "La solución: …" paragraph of each project's chapter, lines 231-294).
 *
 * `showcase[].src` always matches one `gallery[].src` of the same project —
 * verified against the artifact's asset map in
 * `docs/reference/artifact-a/README.md` while writing this file.
 *
 * English hotspot/island copy is a faithful translation; the artifact itself
 * is Spanish-only.
 */

const SOLUTIONS: Record<string, Localized<string>> = {
  "nave24-stock": {
    es: "Cada terminal registra movimientos que se difunden al instante con Supabase Realtime; el stock se actualiza en todas las pantallas y avisa cuando baja del umbral.",
    en: "Every terminal logs movements that broadcast instantly via Supabase Realtime; stock updates across every screen and flags items once they cross the reorder threshold.",
  },
  "veebot-saas": {
    es: "Datos aislados por tenant, scoring con IA, búsqueda semántica en Pinecone y un gemelo digital que responde preguntas sobre cada CV.",
    en: "Tenant-isolated data, AI scoring, semantic search in Pinecone, and a digital twin that answers questions about each résumé.",
  },
  "estudio-zanacchi": {
    es: "Un formulario guiado que pre-categoriza el caso y lo deriva a un chat seguro, ya con el contexto escrito.",
    en: "A guided form that pre-categorizes the case and routes it to a secure chat, already carrying the written context.",
  },
  "portafolio-mel": {
    es: "Carga progresiva de imágenes y transiciones medidas para sostener la fluidez en móvil sin resignar impacto visual.",
    en: "Progressive image loading and measured transitions that keep things fluid on mobile without giving up visual impact.",
  },
  "consultorio-odontologico": {
    es: "El tratamiento elegido viaja pre-cargado al chat, listo para agendar la consulta.",
    en: "The chosen treatment travels pre-loaded into the chat, ready to book the appointment.",
  },
};

const SHOWCASE: Record<string, ShowcaseShot[]> = {
  "nave24-stock": [
    {
      src: "/projects/nave24stock/stock-dash.png",
      islandLabel: { es: "Realtime", en: "Realtime" },
      islandSub: { es: "T-B → stock", en: "T-B → stock" },
      hotspots: [
        { u: 0.655, v: 0.3, label: { es: "Productos almacenados", en: "Stored products" }, sub: { es: "conteo vivo, una escritura por unidad", en: "live count, one write per unit" } },
        { u: 0.29, v: 0.56, label: { es: "Actividad reciente", en: "Recent activity" }, sub: { es: "cada restock con su recibo", en: "every restock with its receipt" } },
      ],
    },
    {
      src: "/projects/nave24stock/stock-inventory.png",
      islandLabel: { es: "Stock bajo", en: "Low stock" },
      islandSub: { es: "reponer", en: "reorder" },
      hotspots: [
        { u: 0.935, v: 0.475, label: { es: "Bajo umbral", en: "Below threshold" }, sub: { es: "dispara la reposición", en: "triggers the reorder" } },
        { u: 0.62, v: 0.21, label: { es: "Filtro por categoría", en: "Category filter" }, sub: { es: "bebidas · alimentos · golosinas", en: "drinks · food · candy" } },
      ],
    },
    {
      src: "/projects/nave24stock/stock-sales.png",
      islandLabel: { es: "Venta", en: "Sale" },
      islandSub: { es: "stock −3 ✓", en: "stock −3 ✓" },
      hotspots: [
        { u: 0.52, v: 0.225, label: { es: "Buscar cliente", en: "Search customer" }, sub: { es: "o crearlo en el momento", en: "or create one on the spot" } },
        { u: 0.5, v: 0.385, label: { es: "Crear nuevo cliente", en: "Create new customer" }, sub: { es: "checkout en dos pasos", en: "two-step checkout" } },
      ],
    },
  ],
  "veebot-saas": [
    {
      src: "/projects/veeBot/bot-dash.png",
      islandLabel: { es: "Gemini", en: "Gemini" },
      islandSub: { es: "scoring CV", en: "CV scoring" },
      hotspots: [
        { u: 0.645, v: 0.17, label: { es: "Calidad global", en: "Overall quality" }, sub: { es: "promedio del pipeline del tenant", en: "tenant pipeline average" } },
        { u: 0.48, v: 0.49, label: { es: "Match IA", en: "AI match" }, sub: { es: "puntaje por candidato y rol", en: "score per candidate and role" } },
      ],
    },
    {
      src: "/projects/veeBot/bot-DigitalTwins-1.png",
      islandLabel: { es: "Twin", en: "Twin" },
      islandSub: { es: "entrevista", en: "interview" },
      hotspots: [
        { u: 0.69, v: 0.2, label: { es: "Gemelo digital", en: "Digital twin" }, sub: { es: "responde desde el CV", en: "answers from the résumé" } },
        { u: 0.34, v: 0.27, label: { es: "Pool del tenant", en: "Tenant pool" }, sub: { es: "aislado por agencia", en: "isolated per agency" } },
      ],
    },
    {
      src: "/projects/veeBot/bot-comparator2.png",
      islandLabel: { es: "Veredicto", en: "Verdict" },
      islandSub: { es: "listo", en: "ready" },
      hotspots: [],
    },
  ],
  "estudio-zanacchi": [
    {
      src: "/projects/estudio/estudio-back.png",
      islandLabel: { es: "Sitio", en: "Site" },
      islandSub: { es: "PROD", en: "PROD" },
      hotspots: [
        { u: 0.145, v: 0.79, label: { es: "Consulta directa", en: "Direct consultation" }, sub: { es: "CTA principal del hero", en: "the hero's main CTA" } },
        { u: 0.785, v: 0.53, label: { es: "Credenciales", en: "Credentials" }, sub: { es: "matrícula · UNT", en: "bar license · UNT" } },
      ],
    },
    {
      src: "/projects/estudio/estudio-areas.png",
      islandLabel: { es: "Áreas", en: "Areas" },
      islandSub: { es: "3 frentes", en: "3 fronts" },
      hotspots: [
        { u: 0.235, v: 0.6, label: { es: "Áreas de práctica", en: "Practice areas" }, sub: { es: "consumidor · penal · género", en: "consumer · criminal · gender" } },
        { u: 0.6, v: 0.92, label: { es: "Consultar ahora", en: "Consult now" }, sub: { es: "abre la recepción del caso", en: "opens the case intake" } },
      ],
    },
    {
      src: "/projects/estudio/estudio-contacto-2.png",
      islandLabel: { es: "Caso", en: "Case" },
      islandSub: { es: "→ chat", en: "→ chat" },
      hotspots: [
        { u: 0.36, v: 0.36, label: { es: "Naturaleza del conflicto", en: "Nature of the conflict" }, sub: { es: "pre-categoriza el caso", en: "pre-categorizes the case" } },
        { u: 0.5, v: 0.8, label: { es: "Iniciar chat seguro", en: "Start secure chat" }, sub: { es: "deriva a WhatsApp", en: "routes to WhatsApp" } },
      ],
    },
  ],
  "portafolio-mel": [
    {
      src: "/projects/portafolio-mel/portafolio-back.png",
      islandLabel: { es: "fps", en: "fps" },
      islandSub: { es: "en vivo", en: "live" },
      hotspots: [],
    },
    {
      src: "/projects/portafolio-mel/portafolio-hoverSlider.png",
      islandLabel: { es: "fps", en: "fps" },
      islandSub: { es: "en vivo", en: "live" },
      hotspots: [],
    },
    {
      src: "/projects/portafolio-mel/portafolio-carousel-1.png",
      islandLabel: { es: "fps", en: "fps" },
      islandSub: { es: "en vivo", en: "live" },
      hotspots: [],
    },
  ],
  "consultorio-odontologico": [
    {
      src: "/projects/consultorio/consul-back.png",
      islandLabel: { es: "Sitio", en: "Site" },
      islandSub: { es: "DEV", en: "DEV" },
      hotspots: [
        { u: 0.1, v: 0.72, label: { es: "Agendar cita", en: "Book appointment" }, sub: { es: "CTA principal", en: "main CTA" } },
        { u: 0.655, v: 0.72, label: { es: "Escáner 3D", en: "3D scanner" }, sub: { es: "cero impresiones", en: "zero impressions" } },
      ],
    },
    {
      src: "/projects/consultorio/consul-tratamientos.png",
      islandLabel: { es: "Turno", en: "Appointment" },
      islandSub: { es: "tratamiento", en: "treatment" },
      hotspots: [
        { u: 0.5, v: 0.75, label: { es: "Aclaramiento láser", en: "Laser whitening" }, sub: { es: "una sesión, protocolo médico", en: "one session, medical protocol" } },
        { u: 0.93, v: 0.945, label: { es: "Agendá tu cita", en: "Book your visit" }, sub: { es: "pre-carga el tratamiento", en: "pre-loads the treatment" } },
      ],
    },
    {
      src: "/projects/consultorio/consul-ortInvisible.png",
      islandLabel: { es: "Chat", en: "Chat" },
      islandSub: { es: "pre-cargado", en: "pre-loaded" },
      hotspots: [
        { u: 0.6, v: 0.32, label: { es: "iTero 5D Plus", en: "iTero 5D Plus" }, sub: { es: "escaneo intraoral", en: "intraoral scan" } },
        { u: 0.76, v: 0.885, label: { es: "Fase 02 / 14", en: "Phase 02 / 14" }, sub: { es: "seguimiento del alineador", en: "aligner tracking" } },
      ],
    },
  ],
};

export const PROJECTS: ProjectContent[] = PROJECTS_DATA.map((project) => ({
  id: project.id,
  index: project.index,
  title: project.title,
  status: project.status,
  statusLabel: project.statusLabel,
  architecture: project.architecture,
  stack: project.stack,
  location: project.location,
  heroImage: project.heroImage,
  scope: project.scope,
  challenge: project.challenge,
  solution: SOLUTIONS[project.id],
  objectives: project.objectives,
  gallery: project.gallery,
  showcase: SHOWCASE[project.id] ?? [],
  liveUrl: project.liveUrl,
  // `latency` intentionally dropped — plan finding A2, no fabricated metric.
}));

export function getProjectContent(id: string): ProjectContent | undefined {
  return PROJECTS.find((project) => project.id === id);
}
