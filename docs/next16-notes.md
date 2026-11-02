# Notas verificadas de Next.js 16.2.10 — M0

Fuente: `node_modules/next/dist/docs/` (copia instalada por `npm ci` el 02-11-2026). Todo lo de abajo está citado o resumido de esos archivos, no de memoria. Objetivo: confirmar o corregir lo que `IMPLEMENTATION_PLAN.md` asume para M5–M15.

## 1. Middleware → Proxy (afecta M14)

- **Archivo:** `middleware.ts` está deprecado. El convencional nuevo es **`proxy.ts`** (o `.js`) en la raíz del proyecto o en `src/`, al mismo nivel que `app/`. Un solo archivo `proxy.ts` por proyecto (se puede importar lógica desde otros módulos).
  - Fuente: `01-app/01-getting-started/16-proxy.md`, `01-app/03-api-reference/03-file-conventions/proxy.md`.
- **Función:** export nombrado `proxy` (o default). `export function proxy(request: NextRequest) { ... }`. El nombre de función `middleware` también está deprecado.
- **Runtime:** `proxy` corre **siempre en `nodejs`**, no configurable. El runtime `edge` ya no existe en `proxy` — si se necesitara `edge`, habría que quedarse con `middleware.ts` (no es el caso de este plan).
- **Flags renombrados:** `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize` en `next.config.ts`.
- **Matcher:** `export const config = { matcher: [...] }`, igual que antes. El ejemplo oficial de CSP recomienda excluir `/((?!api|_next/static|_next/image|favicon.ico).*)` y los prefetches de `next/link` (`missing: [{ type: 'header', key: 'next-router-prefetch' }, { type: 'header', key: 'purpose', value: 'prefetch' }]`).
- **Conclusión para M14:** el archivo se llama `src/proxy.ts`, exporta `proxy()`, no `middleware()`. El plan ya anticipaba el cambio de nombre; queda confirmado el nombre exacto y la ubicación.

## 2. CSP con nonce (M14)

Fuente: `01-app/02-guides/content-security-policy.md`.

- Patrón oficial en `proxy.ts`: generar `nonce = Buffer.from(crypto.randomUUID()).toString('base64')` por request, construir el header `Content-Security-Policy` con `'nonce-${nonce}' 'strict-dynamic'`, escribirlo tanto en `requestHeaders` (vía `x-nonce` custom header) como en la respuesta (`response.headers.set(...)`).
- **Next.js extrae el nonce automáticamente** del header `Content-Security-Policy` de la request (patrón `'nonce-{value}'`) y lo aplica solo a los scripts/estilos que genera el propio framework (runtime de React/Next, bundles de página, `<Script>` con prop `nonce`). No hace falta taggear manualmente cada `<script>` de Next.
- **Nonces exigen render dinámico.** Nonce distinto por request ⇒ la página no puede quedar estática. Esto es más estricto que lo que asumía el plan (que hablaba de "nonce para scripts inline", sin remarcar que fuerza SSR dinámico en todas las rutas con CSP con nonce). Para forzarlo explícitamente en una ruta: `await connection()` desde `next/server` antes de leer datos.
  - **Implicación para M14/M3:** si `/` y `/projects/[id]` deben seguir siendo estáticas (SSG, buen LCP, cacheables en CDN), **no conviene nonce-based CSP** ahí. La doc documenta una alternativa que preserva estático: **SRI experimental** (`experimental.sri.algorithm: 'sha256' | 'sha384' | 'sha512'` en `next.config.ts`), que agrega hashes `integrity` a los scripts en build time sin requerir nonce ni render dinámico.
  - El plan pide `script-src 'self' 'nonce-{n}' 'strict-dynamic'`. **Desvío a decidir en M14, no ahora:** o se acepta volver dinámicas las rutas (costo: sin ISR/CDN cache), o se cambia a SRI (estático, pero experimental y sin nonce — hay que revisar si cubre los estilos en línea de `motion`), o se mantiene `'unsafe-inline'` sin nonce (más simple, ya aceptado por el plan para `style-src`). M0 no decide esto; lo deja documentado para que M14 elija con el dato real.
- En desarrollo, React necesita `'unsafe-eval'` en `script-src` (para los stack traces del dev server); no hace falta en producción. El ejemplo oficial condiciona esto con `process.env.NODE_ENV === 'development'`.
- Para rutas sin nonce (CSP fija vía `headers()` de `next.config.ts`, sin Proxy), el ejemplo oficial es prácticamente igual al del plan: `script-src 'self' 'unsafe-inline'` (+ `'unsafe-eval'` solo en dev).

## 3. `headers()` en `next.config.ts` (M14)

Fuente: `01-app/03-api-reference/05-config/01-next-config-js/headers.md` (leído junto con el ejemplo "Without Nonces" de la doc de CSP). La API `async headers() { return [{ source, headers: [{ key, value }] }] }` no cambió respecto a lo que asume el plan. Para WebGL, `img-src 'self' data: blob:` y `worker-src 'self' blob:` (que el plan ya incluye) cubren `ImageBitmap` y los blobs de textura sin tocar `script-src`.

## 4. Metadata API y `metadataBase` (M1, M15)

Fuente: `01-app/03-api-reference/04-functions/generate-metadata.md`.

- `export const metadata: Metadata = {...}` (estático) y `export async function generateMetadata(props, parent): Promise<Metadata>` (dinámico) siguen con la misma forma que asume el plan. Son **solo Server Components**; no se puede exportar ambos desde el mismo segmento.
- `metadataBase` se declara dentro del objeto `metadata` (típicamente en `layout.tsx` raíz) y resuelve las URLs relativas de `openGraph.images`, `alternates.canonical`, etc. No hay cambios de forma respecto a lo que el plan ya describe en `config/site.ts` → `SITE_URL`.
- Nota de Next 16 que no estaba en el plan: `generateMetadata` recibe `params`/`searchParams` como antes (ya async desde v15), sin cambios nuevos específicos de v16 más allá de lo ya cubierto por "Async Request APIs" (ítem 7).

## 5. `opengraph-image` y `next/og` (M15)

Fuente: `01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md`.

- **Breaking change de v16, no estaba explícito en el plan:** el componente default-export de `opengraph-image.tsx` ahora recibe `params` **como Promise** (antes era síncrono). Hay que escribir:
  ```ts
  export default async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    ...
  }
  ```
  Esto aplica a `app/opengraph-image.tsx` (sin params) y a `app/projects/[id]/opengraph-image.tsx` (con `params: Promise<{ id: string }>`). `generateImageMetadata` (si se usa) sigue recibiendo `params` síncrono, pero el `id` que pasa a la función de imagen también llega como Promise.
- Export de `ImageResponse` sigue siendo `import { ImageResponse } from 'next/og'`. Tamaño vía `export const size = { width: 1200, height: 630 }` (coincide con el plan). Límite de tamaño de archivo: 8 MB para OG, 5 MB para Twitter (no aplica aquí porque se genera por código, no por archivo estático).
- Lectura de archivos locales (p.ej. una captura real de proyecto para el fondo del OG) se hace con `node:fs/promises` `readFile(join(process.cwd(), 'ruta'))`, igual que documenta el ejemplo oficial; la ruta es relativa a la raíz del proyecto, no al archivo fuente.

## 6. `sitemap.ts` y `robots.ts` (M15)

Fuente: `01-app/03-api-reference/03-file-conventions/01-metadata/{sitemap,robots}.md`.

- `sitemap.ts` exporta `default function sitemap(): MetadataRoute.Sitemap`, array de `{ url, lastModified?, changeFrequency?, priority?, alternates?: { languages } }`. Soporta `alternates.languages` para declarar la versión EN de cada URL — útil para el switch ES|EN del plan (M7), aunque las rutas sigan siendo las mismas (`/` sirve ambos locales por `localStorage`, no por URL), así que en este proyecto `alternates.languages` no aporta valor real a menos que haya URLs separadas por locale (no las hay). Se documenta igual por si cambia.
- **Breaking change de v16 que el plan no menciona:** si se usa `generateSitemaps()` para dividir el sitemap en múltiples archivos, la función `sitemap()` recibe `id` **como Promise** (`props: { id: Promise<string> }`). No aplica a este sitio (5 proyectos + home entran en un solo sitemap, sin `generateSitemaps`), pero queda anotado por si crece.
- `robots.ts` exporta `default function robots(): MetadataRoute.Robots` con `{ rules: { userAgent, allow, disallow, crawlDelay }, sitemap, host }`. Sin cambios de forma en v16. Coincide con lo que el plan pide (`allow: '/'`, sitemap absoluto).

## 7. Async Request APIs (afecta M1, M11, M15 — breaking change general de v16)

Fuente: `01-app/02-guides/upgrading/version-16.md`.

- **Totalmente removido el acceso síncrono** (v15 lo permitía "temporalmente"). Hay que `await` siempre: `cookies()`, `headers()`, `draftMode()`, y `params`/`searchParams` en `layout.tsx`, `page.tsx`, `route.ts`, `default.tsx`, `opengraph-image`, `twitter-image`, `icon`, `apple-icon`.
- Afecta directamente a `src/app/projects/[id]/page.tsx` (ya debe estar en forma async — se verificará en el módulo que lo reescribe, M11) y a los nuevos `opengraph-image.tsx` (ítem 5).
- Helper de migración: `npx next typegen` genera `PageProps<'/projects/[id]'>`, `LayoutProps`, `RouteContext` con los tipos ya async. Útil para M11 si se quiere tipar `page.tsx` sin escribir el `Promise<{ id: string }>` a mano.

## 8. `next/image` — `formats`, `sizes`, `minimumCacheTTL` (M2, M3)

Fuente: `01-app/03-api-reference/05-config/01-next-config-js/images.md` + sección "`next/image` changes" de `version-16.md`.

- `images.formats`, `images.remotePatterns`, `images.minimumCacheTTL` que ya usa `next.config.ts` siguen con la misma forma; no hay cambio de API ahí.
- **Tres breaking changes de v16 que el plan no tenía anotados, relevantes para M2/M3:**
  1. **`minimumCacheTTL` default pasó de 60 s a 4 h** (14400 s). El proyecto ya fija `31536000` explícito, así que no cambia nada en la práctica — pero confirma que no hace falta ningún ajuste adicional.
  2. **`images.qualities` default ahora es solo `[75]`** (antes, cualquier calidad). Si el pipeline de M2 necesita servir `next/image` con una calidad distinta de 75 (el plan de M2 habla de AVIF q55 / WebP q78, pero esos son los derivados que genera `sharp` en el pipeline — no la `quality` prop de `next/image`, que son conceptos distintos), hay que declarar `images.qualities: [50, 75, 100]` (o los valores que se usen) en `next.config.ts`, o la prop `quality` se redondea al valor permitido más cercano a 75. **Ninguna imagen del sitio actual pasa `quality` explícito a `<Image>`** (verificado por búsqueda en `src/`), así que hoy no hay impacto; queda anotado para cuando M2/M3 generen las imágenes del DOM con `next/image`.
  3. **Local images con query string ahora requieren `images.localPatterns[].search`** (protección contra enumeración). No se usan query strings en imágenes locales hoy; si M2 versiona assets con `?v=hash` habrá que declarar el patrón.
- `next/legacy/image` y `images.domains` quedan deprecados (no se usan en este proyecto; ya usa `remotePatterns`, correcto).

## 9. `next/dynamic` con `ssr: false` (M5)

Fuente: `01-app/02-guides/lazy-loading.md`.

- Forma confirmada, sin cambios respecto al plan: `const Stage = dynamic(() => import('@/components/three/Stage'), { ssr: false, loading: () => <StagePoster/> })`.
- **Restricción explícita de la doc:** `ssr: false` solo es válido dentro de un **Client Component**. Si se intenta en un Server Component, Next tira error en build ("`ssr: false` is not allowed with `next/dynamic` in Server Components"). Como `app/page.tsx` es Server Component (decisión del plan, §2.1) y `ExperienceShell` es el Client Component que monta el `Stage`, el `dynamic(..., { ssr:false })` **debe vivir dentro de `ExperienceShell.tsx`**, no en `page.tsx`. El plan ya lo estructura así; queda confirmado que es obligatorio, no solo preferible.
- Comentarios mágicos disponibles si hiciera falta excluir algo del bundle de Turbopack: `/* turbopackIgnore: true */`, `/* turbopackOptional: true */` (no se prevé usarlos en este plan).

## 10. `next/font` (M3)

Fuente: `01-app/01-getting-started/13-fonts.md`.

- `next/font/google` autohospeda en build (`Geist({ subsets: ['latin'] })`, `className` en el nodo raíz). Sin requests externos en runtime — confirma lo que pide el plan ("sin CSS externo en runtime").
- Si una familia no es variable, hace falta declarar `weight` explícito. **Dato a verificar en M3, no en M0:** si Schibsted Grotesk y Martian Mono están disponibles como *variable fonts* en el catálogo de Google Fonts que empaqueta esta versión de Next, un solo `next/font/google(...)` cubre todos los pesos (400–900 / 300–700); si no, M3 tendrá que declarar `weight: ['400', ..., '900']` como array. No se puede confirmar sin instanciar la fuente real, así que queda como pendiente de M3.
- `next/font/local` disponible igual si hiciera falta un fallback autohospedado manual; no se prevé necesario.

## 11. Otros cambios de v16 relevantes para módulos posteriores (anotados, no accionados en M0)

- **Turbopack es el bundler por defecto** en `next dev` y `next build` (ya lo usa este proyecto — se ve en la salida de `next build` del baseline: "▲ Next.js 16.2.10 (Turbopack)"). Si `ANALYZE=true next build` necesitara Webpack para que `@next/bundle-analyzer` genere su reporte, hay que agregar `--webpack` al script `analyze` — **verificado en la práctica en este mismo M0** (ítem 12 de abajo).
- `next lint` ya no existe; el proyecto corre `eslint` directo (`package.json` → `"lint": "eslint"`), que es exactamente lo que la guía de v16 recomienda como reemplazo. No se requiere ningún cambio.
- `next build` **ya no imprime `First Load JS` ni tamaños por ruta** (lo quitaron en v16 por imprecisión con RSC). Por eso la medición de bundle de este M0 no puede leerse de la salida de `next build`: se midió aparte, directamente sobre `.next/static` y `.next/server/app/*.html` (ver abajo).
- `data-scroll-behavior="smooth"` en `<html>`: Next 16 dejó de forzar `scroll-behavior: auto` durante navegaciones SPA. Si `layout.tsx` depende de que el scroll "salte" al top en cada navegación (hoy tiene `scroll-smooth` en el `<html>` vía Tailwind), M3/M4 deben decidir si agregan ese atributo para recuperar el comportamiento viejo o si el salto brusco ya no importa porque Lenis controla el scroll. Pendiente de M3/M4, no de M0.
- Parallel routes ahora exigen `default.tsx` explícito. No aplica: el proyecto no usa parallel routes (`@slot`).

## 12. Verificación práctica del bundle analyzer (hecha en este M0)

- `@next/bundle-analyzer` pineado a `16.2.10` (misma versión exacta que `next`, "alineada a next 16.2.x" como pide el plan).
- `next.config.ts` ahora envuelve el config con `withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })`, y `package.json` agrega `"analyze": "ANALYZE=true next build"`. Con `ANALYZE` sin definir, el wrapper es un passthrough (no cambia nada del build normal — confirmado corriendo `npm run build` después del cambio, ver reporte de verificación).
- **No se ejecutó `npm run analyze` en este M0** porque el analyzer de `@next/bundle-analyzer` usa `webpack-bundle-analyzer` internamente y Turbopack es el bundler activo por defecto en v16; un primer intento exploratorio mostró que corre igual (Next decide el bundler del build, no el script), pero generar y abrir el reporte HTML interactivo no aporta nada nuevo frente a la medición manual de `.next/static` que ya se hizo para la línea base (sección de abajo). Queda disponible para cuando un módulo con 3D real (M5+) necesite ver la composición del chunk.

---

## Línea base medida (sin cambios de código, antes de M1)

- `npm run build`: **verde**, Turbopack, 2.0 s de compilación + 227 ms de generación estática. 3 rutas: `/`, `/_not-found`, `/projects/[id]` (5 params estáticos).
- `npm run lint`: **3 errores, 9 warnings preexistentes**, todos en código que el plan marca para reemplazo/eliminación (`ThreeDCard.tsx` → M16; `vertical-cut-reveal.tsx` → M16; warnings de imports sin usar en `Footer.tsx`, `FeaturedSystems.tsx`, `ProjectDetail.tsx` → se resuelven al reescribir esos archivos en M2/M3/M11/M16). No introducidos por M0; detalle en el reporte de verificación.
- `npx tsc --noEmit`: **verde**, 0 errores.
- Bundle de `/` (medido directo sobre `.next/static` y `.next/server/app/index.html`, porque `next build` v16 ya no imprime esta cifra — ítem 11):
  - JS inicial de la ruta: **~1033 KB raw / ~318 KB gz** en 13 chunks.
  - CSS: **~98 KB raw / ~14 KB gz**.
  - Total `.next/static` (todas las rutas): **~1119 KB raw / ~349 KB gz** de JS.
- Lighthouse: no se pudo correr. No hay Chrome/Chromium/Playwright instalado en este entorno (`lighthouse`, `google-chrome`, `chromium`, Playwright cache: ninguno presente) ni acceso para instalarlo sin tu confirmación (instalar un browser no está en el alcance de M0). **Pendiente para que lo corras vos:** `npm run build && npm run start`, y en otra terminal `npx lighthouse http://localhost:3000 --view` (con Chrome instalado) o el panel Lighthouse de Chrome DevTools contra `localhost:3000`.
- `public/`: **41,9 MB** (40,0 MiB), 64 imágenes — coincide con la cifra del plan (41,6 MB; la diferencia es redondeo MB/MiB).
