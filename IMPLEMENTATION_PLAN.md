# IMPLEMENTATION_PLAN.md — Reingeniería total de `portafolio_dev`

> **Objetivo:** llevar `portafolio_dev` (Next.js 16 · React 19 · Tailwind v4) a la experiencia aprobada en el **Artefacto A «Banco de pruebas» (grafito + limón)**, v19. Incluye: MacBook plateada con monograma IZ que se abre con el scroll desde el hero cenital, iPhone Pro con Dynamic Island, credencial colgante, maletín de certificaciones, recorrido por proyectos con capturas reales, encuadre automático en todos los tamaños y navbar Dynamic Island.
>
> **Estado de esta fase:** solo planificación. No se modificó código fuente, no se tocaron `gz_systems` ni `ordini` y no se ejecutó ningún comando de Git que cambie el repo.
>
> **Fuente de verdad visual y de comportamiento:** artefacto A, exportado al repo en **`docs/reference/artifact-a/`** (`Hero.dc.html`, `DESIGN.dc.html`, `Storyboard.dc.html`, `Responsive.dc.html` + `README.md` con el mapa exacto de assets). Cada módulo de este plan porta una parte de ese prototipo, que hoy funciona en three.js imperativo, a componentes de React Three Fiber, con el mismo comportamiento y las mismas constantes.

---

## 0. Resumen ejecutivo

| Tema | Decisión |
|---|---|
| Motor 3D | `three` + `@react-three/fiber` v9 (compatible con React 19) + `@react-three/drei` v10 solo para utilidades puntuales (`PerformanceMonitor`, `useDetectGPU`). Geometría **procedural**: sin GLTF, sin assets 3D externos y sin costo de licencias. |
| Scroll | Lenis como **única** fuente de scroll. El progreso se escribe en un store mutable (`scrollStore`), sin `useState` en ningún camino de scroll. R3F lo lee en `useFrame` y el DOM en `MotionValue`. |
| Coreografía | Capítulos en unidades de pantalla (`PMAX = 16.7`). Keyframes con interpolación cúbica monótona (Fritsch–Carlson), resortes sub-pasados y encuadre automático por puntos ponderados, portados 1:1 del artefacto. |
| Imágenes | 41,6 MB de PNG en `public/` → pipeline con `sharp` (ya instalado): WebP para texturas 3D y AVIF/WebP con `next/image` para el DOM. Peso servido estimado: −85 a −90 %. |
| Rendimiento | Presupuestos explícitos de frame, draw calls, triángulos, VRAM y JS. DPR adaptativo `[1, 1.5]`, pausa por visibilidad, cero re-renders por scroll. |
| Seguridad | Cabeceras en `next.config.ts` y CSP estricta (WebGL no necesita `unsafe-eval`). Ver pilar 5. |
| SEO | Metadata API, `opengraph-image`, `sitemap.ts`, `robots.ts` y JSON-LD (`Person`, `ProfilePage`, `WebSite`, `CreativeWork` por proyecto). Todo el texto del recorrido vive en el DOM semántico. |
| Entrega | 17 módulos atómicos, de M0 a M16, con stop-and-wait y handoff de Git por módulo. Yo no ejecuto Git. |

### 0.1 Decisiones (actualizado 02-11-2026)

**Confirmadas:**

1. **Rol:** `Full-Stack Developer`, en copy, metadata y JSON-LD. Docker, CI/CD y seguridad se mencionan como parte de la entrega (`knowsAbout`), nunca como «DevOps» ni «DevSecOps» en el título.
2. **Dominio:** por ahora solo el de Vercel (`*.vercel.app`). `SITE_URL` se resuelve en `config/site.ts`, en este orden:
   - `process.env.NEXT_PUBLIC_SITE_URL` (para un dominio propio futuro)
   - `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` (variable de sistema de Vercel, dominio de producción)
   - `http://localhost:3000`

   Cuando haya dominio propio, se cambia una sola variable de entorno; no hace falta tocar código.
3. **Idioma:** **español por defecto** (`DEFAULT_LOCALE = "es"`, SSR, `<html lang="es">`, metadata y JSON-LD en español). Inglés disponible con un **switch ES | EN dentro de la Dynamic Island** (ver M7). Se mantiene el mecanismo actual del lado del cliente (`LanguageProvider` + `localeStore`, persistido en `localStorage`), que actualiza `document.documentElement.lang`.

**Pendientes, con un default seguro mientras tanto:**

4. **Rama `dev`:** el repo solo tiene `main`. Los handoffs apuntan a `dev`, así que tenés que crearla antes del primer PR. Yo no ejecuto Git.
5. **Objetos de contenido frente a los equipos:** el default es el del artefacto aprobado. La zona de exclusión aplica a toda geometría decorativa o secundaria, y solo la credencial en verificación y el módulo de stack en foco usan un **slot de presentación** acotado (§2.3). Si preferís que nada cruce por delante, van al costado.
6. **DNI en `FullStack.png`:** bloquea M2. Hace falta la imagen reexportada sin el dato, o tu autorización para taparlo con el pipeline (franja opaca en la región del DNI) y verificarlo visualmente.

---

## 1. Auditoría del repo actual y estrategia de reemplazo total

### 1.1 Estado actual, medido el 02-11-2026

- **Stack:** `next 16.2.10`, `react 19.2.4`, `motion 12.x` (el sucesor de framer-motion, importado como `motion/react` con `LazyMotion` y `m`), `lenis 1.3.x`, `react-icons`, `sharp`, `clsx`, `tailwind-merge`, Tailwind v4 CSS-first. **Sin dependencias 3D.**
- **Código:** 6.942 líneas en `src/`. `data/projects.ts` tiene 1.497 líneas, con 5 proyectos y 52 capturas con caption, alt y specs bilingües. Los diccionarios `i18n/dictionaries/{es,en}.ts` tienen unas 440 líneas cada uno.
- **Rutas:** `/` (HeroPaths, TechStackBento, FeaturedSystems, EngineeringPipeline) y `/projects/[id]` (ProjectDetail con galería por pestañas y paginación), con `generateStaticParams` y `generateMetadata`.
- **`node_modules` no está instalado** en esta copia. M0 lo resuelve con `npm ci`.
- **`AGENTS.md`:** «This is NOT the Next.js you know» → antes de escribir código de Next hay que leer `node_modules/next/dist/docs/`. Ver M0.
- **`CLAUDE.md`** tiene un protocolo que se respeta en todos los módulos: sticky aislado, prohibido `overflow-hidden` en `main` y `section`, bounding boxes en imágenes, `will-change-transform transform-gpu`, marquees en CSS y escanear archivos antes de escribir código.

**Problemas detectados:**

| # | Hallazgo | Acción |
|---|---|---|
| A1 | `app/page.tsx` renderiza un `<main>` dentro del `<main>` de `layout.tsx`: landmark duplicado. | Un único `<main>` en el layout. |
| A2 | Métricas no verificables en los datos (`latency: "0.35ms"`, `"5.7ms (staging)"`…) y en las secciones de diccionario `telemetry` y `topology` («auditorías de clúster sub-milisegundo»). | Se eliminan (M1). |
| A3 | Navegación huérfana: Topología, Telemetría y Terminal figuran en el diccionario y el navbar, pero `page.tsx` no las monta. | Se reemplaza por la isla con 5 links (M7). |
| A4 | El rol dice «Full-Stack Software Engineer & DevOps» (metadata y hero). | «Full-Stack Developer» (M1, M15). Confirmado. |
| A5 | Sin cabeceras de seguridad, `robots`, `sitemap`, OG ni JSON-LD. | M14 y M15. |
| A6 | `public/` pesa 41,6 MB: 64 imágenes, hero de hasta 2,85 MB y 2916×1646 px. | Pipeline (M2). |
| A7 | Assets sin uso: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`, 3 `Screenshot 2026-09-06 … .png` en `nave24stock/` y `profile/ivodev.JPG`. | Se eliminan (M2). |
| A8 | `FeaturedSystems` carga un fondo de `images.unsplash.com` (`remotePatterns`). | Se elimina el host y el componente (M2, M16). |
| A9 | Fondo con grilla fija `#ffffff05` y paleta cian. | Se reemplaza por la paleta grafito + limón (M3). |
| A10 | DNI visible en `FullStack.png`. | Reexportar sin el dato (M2). |
| A11 | `components/ui/handwriting-text.tsx` (usado por `HeroPaths.tsx`) carga `opentype.js` como `<script>` de terceros desde `cdn.jsdelivr.net` (40 KB, ~60 % sin usar — medido en la línea base de Lighthouse, `docs/baseline/lighthouse-m0.md`). | Se elimina en M16 junto con `handwriting-text.tsx` y `public/fonts/shadows-into-light.ttf`. No puede quedar ningún uso cuando entre la CSP de M14 (el dominio no está en `script-src`). |

### 1.2 Datos y activos reales que se conservan

| Activo | Origen | Destino |
|---|---|---|
| 5 proyectos (id, título, estado PROD/DEV, arquitectura, stack, scope, challenge, objectives, `liveUrl` de Estudio) | `data/projects.ts` | `content/projects.ts`, tipado y sin `latency`. Se suma `solution` (copy del artefacto) y `hotspots[u,v,label,sub]` por captura. |
| 52 capturas con caption, alt y specs bilingües | `public/projects/**` | Originales en `assets-src/projects/**`, fuera de `public`. Derivados en `public/media/**` (M2). |
| Captura principal de cada proyecto | `heroImage` | Póster OG y pantalla inicial de cada showcase. |
| 5 certificaciones | `CertificationWindows.tsx` y `public/projects/certifications/*` | `content/credentials.ts`: institución, horas, semanas, fecha, certificador y Top 10, con los datos reales que ya usa el artefacto. |
| Formación: UTN FRT (abr 2024 – feb 2027) y UGR (mar 2026 – en curso) | Diccionarios y artefacto | `content/profile.ts` |
| Foto de perfil | `public/profile/ivodev.jpeg` | Textura de la credencial y pantalla de perfil. AVIF/WebP para el DOM. |
| CV en PDF | `public/cv/Ivo_Zanacchi_CV.pdf` | Se mantiene en la misma ruta: link «Descargar CV» en Contacto. |
| Contacto | Email, LinkedIn y GitHub (`ivozanacchi501@gmail.com`, `linkedin.com/in/ivo-zanacchi-87822326a`, `github.com/Izan0501`) | `config/site.ts` (`sameAs`). |
| i18n es/en | `i18n/*` | Se conserva el mecanismo (`Localized<T>`, `LanguageProvider`). **`DEFAULT_LOCALE` pasa a `es`.** La copia se reescribe con los textos del artefacto, en es y en. |
| Captions reales por pantalla | `gallery[].caption` | Barra de URL y caption de cada sub-pantalla 3D. |

### 1.3 Mapa de demolición

**Se elimina, cuando su reemplazo ya existe (M16):**

- `components/sections/HeroPaths.tsx`, `TechStackBento.tsx`, `FeaturedSystems.tsx`, `EngineeringPipeline.tsx`, `CertificationWindows.tsx`, `ToolchainIntegrityScan.tsx`
- `components/ui/ThreeDCard.tsx`, `handwriting-text.tsx` (junto con `public/fonts/shadows-into-light.ttf`), `rotating-text.tsx`, `morphing-spinner.tsx`, `dot-border-button.tsx`, `vertical-cut-reveal.tsx`. La regla 5 de `CLAUDE.md` se actualiza al borrar este último.
- `components/navigation/Navbar.tsx`, reemplazado por `DynamicIslandNav`.
- Secciones de diccionario `topology`, `telemetry` y la terminal; la grilla de fondo de `layout.tsx`; `images.remotePatterns` de Unsplash.

**Se reescribe:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/projects/[id]/page.tsx` + `ProjectDetail`, `Footer`, `SmoothScrollProvider`, `next.config.ts`.

**Se conserva sin cambios:** `i18n/LanguageProvider.tsx`, `i18n/localeStore.ts`, `i18n/config.ts` (solo cambia `DEFAULT_LOCALE` si se confirma), `lib/utils.ts` y `components/ui/pagination.tsx` (lo reutiliza el detalle de proyecto).

### 1.4 Árbol modular objetivo

```text
src/
├─ app/
│  ├─ layout.tsx                 # html lang, fuentes (next/font), providers, JSON-LD global, un solo <main>
│  ├─ page.tsx                   # Server Component: <ExperienceShell/> + copy SSR por capítulo
│  ├─ projects/[id]/page.tsx     # páginas indexables por proyecto (galería next/image)
│  ├─ opengraph-image.tsx        # OG home (next/og)
│  ├─ projects/[id]/opengraph-image.tsx
│  ├─ sitemap.ts · robots.ts · not-found.tsx · loading.tsx
│  └─ globals.css                # tokens DESIGN.md (Tailwind v4 @theme)
├─ views/
│  └─ home/
│     ├─ ExperienceShell.tsx     # client: stage sticky + capítulos DOM + isla
│     └─ chapters/*.tsx          # Hero, Método, Perfil, Formación, Proyectos, Garantías, Contacto (copy semántico)
├─ features/
│  ├─ scroll/                    # scrollStore.ts, useLenisBridge.ts, chapterMath.ts
│  ├─ choreography/              # keyframes.ts (monótona), poses.ts, springs.ts, cameraFit.ts
│  └─ chapters/                  # lógica de estado por capítulo (cert, prof, shots…)
├─ components/
│  ├─ three/
│  │  ├─ Stage.tsx               # <Canvas> (dynamic ssr:false), renderer, env, quality, pausa
│  │  ├─ Environment.tsx         # PMREM procedural de softboxes (sin HDRI)
│  │  ├─ Bench.tsx               # banco shader con pozo de luz (sin regla)
│  │  ├─ CameraDirector.tsx      # encuadre automático + dive
│  │  ├─ ProfileBadge.tsx · StackTiles.tsx · Briefcase.tsx · CertPlates.tsx
│  │  ├─ Callouts.tsx · Pulses.tsx · VeeLayers.tsx · OfficePins.tsx
│  │  └─ textures/               # useCanvasTexture.ts, screenTiers.ts, loaders.ts
│  ├─ macbook/                   # MacBook.tsx (procedural), Keyboard.tsx (instanced), Lid.tsx, screens/*.ts
│  ├─ iphone-island/             # IPhonePro.tsx, PhoneScreen.ts, IslandTexture.ts, DynamicIslandNav.tsx (DOM)
│  ├─ ui/                        # Button, Chip, Sheet («Ver detalle»), Pagination
│  └─ navigation/Footer.tsx
├─ hooks/                        # usePrefersReducedMotion, useVisibilityPause, useViewportProfile
├─ content/                      # profile.ts, chapters.ts, projects.ts, credentials.ts (es/en)
├─ lib/
│  ├─ seo/                       # jsonld.ts (schema-dts), metadata.ts
│  ├─ security/                  # csp.ts, headers.ts
│  └─ math/                      # ease.ts, damp.ts, hermite.ts (puras, testeables)
├─ config/                       # site.ts, chapters.ts (CH, NAV, PMAX), quality.ts (tiers)
└─ types/                        # content.ts, three.ts
scripts/optimize-assets.mjs      # pipeline sharp (M2)
assets-src/                      # originales fuera de public (no se sirven)
```

### 1.5 Dependencias

No pude consultar el registro de npm desde este entorno: no hay red hacia `registry.npmjs.org` y el repo no tiene `node_modules`. **Las versiones exactas se fijan en M0 con `npm view <pkg> version` y quedan pineadas (sin `^`).** El artefacto ya corre sobre `three r186`.

| Paquete | Tipo | Versión objetivo | Motivo |
|---|---|---|---|
| `three` | dep | `0.186.x` (la misma que el artefacto) | Motor WebGL |
| `@types/three` | devDep | La misma minor que `three` | Tipos |
| `@react-three/fiber` | dep | `9.x` | Renderer React para three (v9 = React 19) |
| `@react-three/drei` | dep | `10.x` | Solo `PerformanceMonitor` y `useDetectGPU`, con imports nombrados para tree-shaking |
| `schema-dts` | devDep | La última | JSON-LD tipado |
| `@next/bundle-analyzer` | devDep | Alineada a `next 16.2.x` | Presupuesto de JS |
| `vitest` | devDep (opcional) | La última | Tests de las funciones puras de `lib/math` y `features/choreography` |
| `vite` | devDep | `8.3.5` (satisface el peer `^6.4.0 \|\| ^7.0.0 \|\| ^8.0.0` de `vitest@5.1.0`) | `vitest` lo resuelve en runtime (no solo como peer declarado); sin él, `vitest` falla con `ERR_MODULE_NOT_FOUND` al arrancar. No toca el build de Next (Turbopack, completamente separado): usado solo por `vitest.config.mts` para resolver el alias `@/*` en los tests. Agregado en M1, autorizado por Ivo. |

**No se agrega:** `framer-motion`, porque ya está `motion` (su sucesor) y duplicaría runtime; `@react-three/postprocessing`, que está fuera de presupuesto; `gsap`, porque Lenis + rAF alcanza.

**Se mantiene:** `lenis`, `motion`, `sharp`, `clsx`, `tailwind-merge`. **Se evalúa en M16:** `react-icons`, que quedaría solo para los íconos sociales y podría pasar a SVG inline.

---

## 2. Rendimiento extremo para modelos 3D y scroll

### 2.0 Presupuestos y forma de medir

Un objetivo honesto: el techo de FPS lo pone la frecuencia del monitor (60, 120, 144 o 240 Hz). El compromiso es **mantener el frame time por debajo del período de refresco**, con calidad adaptativa.

| Métrica | Presupuesto |
|---|---|
| Frame time | Desktop gama alta: ≤ 4,1 ms (240 Hz) · desktop medio: ≤ 8,3 ms (120 Hz) · móvil medio: ≤ 16,6 ms (60 Hz) |
| JS por frame (`useFrame` + escritura DOM) | ≤ 1,5 ms en desktop y ≤ 3 ms en móvil |
| Draw calls | ≤ 90. En el artefacto se midieron entre 11 y 84. |
| Triángulos | ≤ 15 k. En el artefacto se midieron entre 2,9 k y 11 k. |
| VRAM de texturas | ≤ 96 MB en desktop y ≤ 48 MB en móvil (tiers en §3.1) |
| JS inicial de la ruta (sin el chunk 3D) | ≤ 120 KB gz |
| Chunk 3D (three + R3F + escena) | ≤ 220 KB gz, cargado en diferido |
| LCP | < 2,0 s (el LCP es el H1 del hero, no el canvas) |
| CLS | < 0,02 |
| INP | < 150 ms |

**Protocolo de medición (M16):**
- Trazas de Chrome Performance con CPU 4× y 6× throttling.
- Lighthouse en móvil y desktop.
- `renderer.info` (calls, triangles, textures, geometries) volcado por un HUD **solo en desarrollo** (`?perf`), nunca en producción.
- Test de fuga: 20 navegaciones home ↔ proyecto con `performance.memory` y `renderer.info.memory` estables.

### 2.1 Aislamiento asíncrono del motor WebGL

- `app/page.tsx` es un **Server Component**. Renderiza todo el copy de los capítulos como HTML semántico (`<section>`, `<h1>`/`<h2>`, listas). El FCP y el LCP no dependen de JS.
- `ExperienceShell` (client) monta el stage con `next/dynamic(() => import('@/components/three/Stage'), { ssr: false, loading: () => <StagePoster/> })` dentro de `<Suspense>`.
- `StagePoster` es una imagen AVIF de la Mac cerrada vista desde arriba (el primer frame del hero), exportada en M2, con dimensiones explícitas (regla 3 de `CLAUDE.md`). El canvas aparece con un fundido de 300 ms cuando el primer frame está listo (`onCreated` + `gl.compileAsync` / `renderer.compile`). Así se evita el «pop» de shaders.
- **Precarga condicional:** el import del chunk 3D se dispara con `requestIdleCallback` (fallback: `setTimeout` de 1 s) después del primer paint. No compite con el LCP.
- **Sin WebGL** (`!WebGL2RenderingContext` o falla del contexto): queda el póster y el recorrido funciona como texto. Es el mismo comportamiento que el `iz-err` del artefacto.

### 2.2 Scroll sin re-renders (`useRef` + `useFrame`)

**Prohibido:** `useState` o context que cambien con el scroll. **Única excepción:** el capítulo activo puede actualizar `aria-current` y textos de la isla **escribiendo directo en el DOM por ref**, igual que `_dom()` en el artefacto.

```ts
// features/scroll/scrollStore.ts — objeto mutable, sin React
export const scrollStore = { pt: 0, p: 0, prevP: 0, vel: 0, dir: 0, progress: 0 };
// useLenisBridge: lenis.on('scroll', ({ scroll }) => { scrollStore.pt = scroll / innerHeight; })
```

- **Un solo bucle:** Lenis con `autoRaf: false`, avanzado desde un `FrameDriver` (`useFrame(..., -1)`) mientras el canvas está activo. Si el canvas está pausado, un rAF de respaldo mantiene vivo a Lenis. Así no hay dos bucles desfasados entre la lectura del scroll y la cámara.
- **Suavizado:** `p = damp(p, pt, λ=7.5, dt)`, con `damp(a,b,λ,dt) = a + (b−a)(1−e^(−λ·dt))`. Es independiente del frame rate. Con `reduced` vale `p = pt`.
- **Velocidad:** `vel = damp(vel, clamp(Δp/dt, −6, 6), 6, dt)` → `lean = clamp(vel, −2.5, 2.5)` alimenta la inercia: Mac `ry += 0.018·lean`, iPhone `rz −= 0.045·lean`, credencial con péndulo de `−0.09·lean`.
- **DOM sincronizado:** el copy de cada capítulo usa `MotionValue`s derivados del store (`useTransform` sobre un `motionValue` que actualiza el bridge), con `opacity` y `translate3d` sin `setState`. Ventanas de entrada y salida: `fin = ss(a−0.05, a+min(0.3, 0.22·span))` y `fout = ss(b−min(0.3, 0.22·span), b+0.02)`.

**Matemática portada del artefacto (`lib/math`, `features/choreography`):**

| Función | Definición | Uso |
|---|---|---|
| `ss(a,b,x)` | smoothstep `t²(3−2t)` | Ventanas, fundidos |
| `win(p,a,b,f)` | `ss(a−f,a+f,p)·(1−ss(b−f,b+f,p))` | Rangos de cada efecto |
| Keyframes | **Hermite cúbica con tangentes monótonas (Fritsch–Carlson)** sobre 21 canales (Mac 6, iPhone 7, cámara 3, target 3, tapa, potencia) | Velocidad continua al cruzar keys intermedias, sin sobrepasos, y esperas quietas |
| Resorte sub-pasado | `v += (−K(x−x*) − C·v)·h; x += v·h`, con `h ≤ 1/240` y `dt` real ≤ 0,5 s | Bisagra (K 140 · C 16, ζ≈0,68), isla (K 380 · C 26), maletín (K 70 · C 8,5), cierres (K 260 · C 14), credencial (K 55 · C 6,5) |
| `CatmullRomCurve3` / Bézier cuadrática | Trayectorias de vuelo | Certificados: pila → arco → slot frente a la pantalla. Pulsos Mac ↔ iPhone. |

**Tres coreografías clave:**

1. **Tapa sobre el pivote real de la bisagra.** Hay un `Group` pivote en `(0, baseT + 0.02, −D/2 + 0.03)`; la tapa es hija con la geometría trasladada `+LH/2`. El pivote elevado evita que las teclas atraviesen la pantalla cerrada (bug corregido en el artefacto). En el hero, con `hk = p/1.55` y `s = ss(0.2, 1.0, hk)`, el ángulo objetivo es `105·s·(0.35+0.65s)°`, filtrado por el resorte de bisagra. Ese ángulo enciende la pantalla (`pow = ss(45°, 100°)`), dispara el parpadeo entre 62° y 70° y la retroiluminación de teclas fila por fila (79 instancias con `setColorAt`).
2. **Hero cenital → entrada orbital.** La cámara recorre `[0.8,9,0.7] → [0.8,8.8,0.9] → [0.2,5,5.2] → [0.45,2.05,7.6]` con Hermite monótona. La Mac gira `π → yaw` con `ss(0.22, 0.95, hk)` (el monograma IZ se lee desde arriba). El iPhone entra con `phPow = ss(1.5, 2.3, p)` y su peso en el encuadre es `ss(1.55, 2.05, p)`.
3. **Transiciones Hero → showcase.** El «Screen Dive» (p 6.6–7.1) mezcla la cámara de encuadre con la del keyframe (`kb = win(p, 6.85, 6.85, 0.45)`). La textura hace zoom 1 → 1,45 antes del corte y 1,35 → 1 al llegar a Nave24.

### 2.3 Presupuesto de GPU, zona de exclusión y VRAM

- **DPR:** `dpr={[1, 1.5]}` + `<PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} flipflops={3}/>`. El `setDpr` es estado del Canvas, no del scroll. En el tier bajo (`useDetectGPU().tier ≤ 1`) el DPR queda fijo en 1 y las pantallas usan el tier «M» de §3.1.
- **Renderer:** `antialias: true` (en tier bajo: `false` + DPR 1,5), `powerPreference: 'high-performance'`, `outputColorSpace = SRGBColorSpace`, `toneMapping = ACESFilmic` (exposición 1,05). Sin sombras dinámicas: se usan blobs de contacto.
- **Encuadre automático = zona de exclusión del texto** (portado de `_fitCam`):
  - La cámara conserva la dirección del keyframe y calcula **distancia mínima, objetivo y `setViewOffset`** para que todos los puntos visibles (Mac, iPhone en escritorio, credencial, maletín, banda de callouts, capas de VeeBot, sedes) entren en el **área libre**: a la derecha del copy en horizontal, entre la isla y la hoja de texto en vertical.
  - Los puntos opcionales entran con **peso continuo** atado al scroll (`P = c + (q − c)·w`), así nunca hay saltos.
  - Distancia: `d ≥ |x_c|/tx + z_c` y `d ≥ |y_c|/ty + z_c`, con `tx = tan(fov/2)·aspect·(ancho libre/vw)·0.94`. Se aleja rápido (λ 9) y se acerca suave (λ 3,5).
  - Medición del artefacto: la aceleración máxima de cámara bajó de 5,49 a 0,27 en escritorio.
- **Zona de exclusión frontal de los equipos:**
  - Todo objeto de la escena declara una `role`: `device | content-slot | secondary`.
  - En cada frame de desarrollo (`assertExclusion`, eliminado en producción) se proyecta el bounding box en pantalla de cada `secondary` y se verifica que, si se superpone con el rect proyectado de la pantalla de la Mac o del iPhone, su profundidad en cámara sea mayor (es decir, que esté detrás). Si no, el test de coreografía falla.
  - Los `content-slot` (la credencial en verificación y el módulo de stack en foco) solo pueden ocupar el slot definido: paralelos a la pantalla, a `z ≤ 0.85` del vidrio, con duración acotada por ventana. Pendiente de tu confirmación (§0.1-5).
  - No hay partículas: el DESIGN.md las prohíbe.
- **Reutilización:**
  - Una geometría por tipo de pieza (`useMemo` a nivel de módulo).
  - `InstancedMesh` para las 79 teclas y las 79 luces (color por instancia).
  - Materiales compartidos en un registro (`alu`, `aluD`, `key`, `ti`, `glass`, `leather`, `brass`, `lining`, `card`, `lemon`).
  - Texturas de etiquetas redibujadas **solo cuando cambia su clave**, como `_macKey` y `_phKey` del artefacto.
- **Pausa:**
  - `IntersectionObserver` sobre el stage + `visibilitychange` → `setFrameloop('never')` / `'always'`.
  - En rutas de proyecto el stage no se monta.
  - `prefers-reduced-motion`: sin resortes ni inercia y `p = pt`, pero se mantienen los estados finales de cada capítulo.
- **Limpieza:**
  - `useEffect` de unmount que recorre la escena y llama `geometry.dispose()`, `material.dispose()`, `map/alphaMap/bumpMap.dispose()`, `pmrem.dispose()` y `renderer.renderLists.dispose()`.
  - `ImageBitmap.close()` tras subir la textura.
  - Listeners de Lenis, observers e intervalos registrados en un `Disposer` único.

---

## 3. Imágenes, capturas y texturas 3D

### 3.1 Nitidez en las pantallas 3D

**Estrategia híbrida, la misma que valida el artefacto:** cada pantalla es una `CanvasTexture` compuesta (captura real + barra de navegador + cursor, hotspots y overlays) y se redibuja solo cuando cambia su clave de estado.

| Superficie | Tier S (móvil) | Tier M | Tier L (desktop DPR ≥ 1,5 o ancho ≥ 1680) |
|---|---|---|---|
| Pantalla de la Mac | 1280×800 | 1600×1000 | 2048×1280 |
| Pantalla del iPhone | 540×1150 | 720×1534 | 900×1916 |
| Placas de certificado | 1024 px de ancho | 1024 | 1536 |
| Credencial y módulos | 528×768 · 1280×800 | ídem | ídem |

- `colorSpace = SRGBColorSpace`.
- `generateMipmaps = true`, `minFilter = LinearMipmapLinearFilter`, `magFilter = LinearFilter`.
- `anisotropy = renderer.capabilities.getMaxAnisotropy()`. Puede ser 16, a diferencia del 8 fijo del artefacto.
- Las pantallas son `MeshBasicMaterial` con `toneMapped: false`, para que el texto no se lave con ACES.
- **Capturas como fuente:** WebP a 2048 px (§3.2), decodificadas fuera del hilo principal con `createImageBitmap(blob, { imageOrientation: 'flipY', premultiplyAlpha: 'none' })` vía `ImageBitmapLoader`. Se cachean por URL y se liberan con `close()`.
- **Legibilidad por posición:** el encuadre automático y el «módulo en foco» (escala 1,7–2,0 frente a la pantalla) cubren lo que en el prototipo se veía borroso en tamaños chicos. En móvil la hoja de texto es compacta, con «Ver detalle», y la Mac ocupa el ancho libre.
- **KTX2/Basis, opcional:** reduce la VRAM unas 4–6 veces, pero exige `toktx` en el build, un transcoder wasm en `public/basis/` y `wasm-unsafe-eval` en la CSP. **No va en el camino crítico.** Se evalúa en M16 solo si la medición de VRAM en móvil supera el presupuesto.

### 3.2 Pipeline de imágenes del DOM

`scripts/optimize-assets.mjs`, con `sharp`, que ya es dependencia del proyecto:

1. Lee `assets-src/**` (los originales se mueven fuera de `public/`).
2. Genera:
   - **DOM:** AVIF (q 55) y WebP (q 78) en 640, 1080, 1600 y 2048 px.
   - **3D:** WebP (q 85) a 2048 px.
   - **Póster:** AVIF del primer frame.
   - **OG:** base PNG de 1200×630 por proyecto.
3. Escribe `content/media-manifest.json` con `{src, w, h, blurDataURL}`. Así se sabe ancho y alto sin leer los archivos en runtime y se evita CLS.
4. En el DOM se usa `next/image` con `sizes` explícitos (por ejemplo `(max-width: 768px) 100vw, (max-width: 1440px) 66vw, 960px`), `placeholder="blur"`, `loading="lazy"` + `decoding="async"` en galerías y `priority` / `fetchPriority="high"` **solo** en el póster del hero. Se mantienen en `next.config.ts` `formats: ['image/avif','image/webp']` y `minimumCacheTTL`.

Estimación: de 41,6 MB de PNG a unos 4–6 MB de derivados WebP y AVIF. Cada página solo descarga los tamaños que usa.

### 3.3 Aceleración por hardware en la UI

- **Solo** se animan `transform` (`translate3d`, `scale`) y `opacity`. Nada de `top`, `left`, `width` ni `height`.
- **Excepción documentada:** la isla anima `width` con resorte. Su `will-change: width` va solo mientras el resorte está activo y se quita cuando reposa.
- `will-change` se agrega al entrar a la ventana de animación y se quita al salir. `transform-gpu` en los nodos de `m.*`, según `CLAUDE.md`.
- **Sticky aislado (regla 1 de `CLAUDE.md`):** el stage usa un `<div>` sticky puro (alto = viewport, `margin-bottom: −100vh`). El canvas y el copy animado van como hijos. Las secciones son espaciadores con ancla.
- `prefers-reduced-motion`: CSS `@media` + `usePrefersReducedMotion`. Sin keyframes CSS en bucle, sin resortes, saltos directos en la navegación por la isla, y Lenis desactivado (ya lo hace hoy).

---

## 4. Fidelidad visual de autor (checklist por componente)

**Tokens (`globals.css` `@theme`, desde el DESIGN.md del artefacto):**

- Grafito `#0D0C0A` · carbón `#171512` · líneas `#2E2A24` / `#4A443B` · hueso `#EEE9DF` · `#C9C2B5` · piedra `#A39C8F` / `#8C857A` (contraste AA verificado) · limón `#E6D84A`.
- Tipografía: **Schibsted Grotesk** (400–900) y **Martian Mono** (300–700, `font-stretch: 87.5%`) vía `next/font/google`, autohospedadas en el build, sin CSS externo en runtime.
- `tabular-nums` en cifras y contadores. Bordes ópticos de 1 px (`box-shadow: inset 0 0 0 1px`).

**Checklist de cada componente antes de cerrar su módulo:**

- [ ] Materiales PBR iguales al artefacto:
  - Aluminio `#C2C8CC`, metalness 1 y roughness 0,30. Oscuro `#8E9290` (0,25).
  - Monograma IZ como `alphaMap` (roughness 0,12).
  - Titanio del iPhone `#4A4740`.
  - Cuero `#2B2520` (0,62) con bump de grano. Latón `#C8B46A`.
- [ ] Entorno PMREM con softboxes procedurales, incluido el panel cenital suave que evita que la tapa plateada se queme en la vista cenital. Sin HDRI externo.
- [ ] Copy sin descripciones de animación y orientado a resultados y garantías. Rol «Full-Stack Developer».
- [ ] Ningún texto tapa un modelo en ninguno de los 13 tamaños de referencia (de 320×568 a 2560×1440, incluidos 1366×768 y 1280×720).
- [ ] **Dynamic Island viva, en tres capas sincronizadas desde el mismo estado:**
  - Isla DOM: siempre centrada y siempre de 40 px de alto. Se pliega al bajar y se despliega hacia los costados al subir, al pasar el mouse, al tocar o con el foco de teclado. Muestra 5 links y un anillo-loader de progreso, sin FPS.
  - Isla 3D: dibujada en la textura del iPhone. Su ancho y alto van con resorte (K 380 · C 26), con etiquetas por sub-pantalla («Realtime · T-B → stock», «Cert 3/5», «CI · lint»…).
  - Caption accesible por capítulo, con `aria-live="polite"` y throttle.
- [ ] Animaciones con propósito, nada genérico:
  - Nave24: pulsos de Realtime de la terminal B a la Mac y contador vivo.
  - VeeBot: vista explotada de 4 capas (ingesta, scoring, vectores, persistencia).
  - Estudio: sedes en Tucumán y Catamarca.
  - Mel: el iPhone al frente.
  - Consultorio: el tratamiento viaja pre-cargado al chat.
  - Formación: maletín → verificación → registro.
  - Perfil: credencial colgante + módulos de stack.
  - Garantías: etapas del pipeline real.
- [ ] Sin gradientes neón ni violetas, sin barras de porcentaje de skills, sin partículas decorativas, sin plantillas.

---

## 5. Seguridad de navegación y SEO técnico

### 5.1 Cabeceras (`next.config.ts` → `headers()`; `lib/security/headers.ts`)

| Cabecera | Valor |
|---|---|
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'nonce-{n}' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self' mailto:; frame-ancestors 'none'; upgrade-insecure-requests` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains`, solo en producción. `vercel.app` ya está en la lista de precarga HSTS de los navegadores; con un dominio propio se agrega `preload` y se lo inscribe. |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY`, redundante con `frame-ancestors` para navegadores viejos |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |

**Notas de compatibilidad:**

- **WebGL:** los shaders de three.js se compilan con la API de WebGL y no necesitan `unsafe-eval`. `blob:` en `img-src` y `worker-src` cubre `ImageBitmap` y los blobs de texturas. `wasm-unsafe-eval` solo hace falta si se adopta KTX2 (§3.1).
- **Nonce:** la CSP con nonce para los scripts inline de Next se emite desde el middleware de Next 16. En la versión 16 su archivo y API cambiaron (es uno de los «breaking changes» que menciona `AGENTS.md`), así que M0 verifica la convención exacta en `node_modules/next/dist/docs/` antes de implementarla.
- **Script de `scrollRestoration` en `layout.tsx`:** pasa a llevar el nonce, o se mueve a un componente cliente.
- **`style-src 'unsafe-inline'`:** es necesario por los estilos en línea de `motion` y de Next. Es aceptable y no ejecuta código.
- **Enlaces externos:** siempre con `rel="noopener noreferrer"` y `target="_blank"`. Se valida en el lint.
- **Sin dominios de terceros en runtime:** se elimina Unsplash y las fuentes son autohospedadas.

### 5.2 SEO para marca personal

- **Metadata API:**
  - `metadataBase = SITE_URL` (resolución de §0.1-2: Vercel `.app` hoy, dominio propio por variable de entorno). `openGraph.locale = "es_AR"`, `alternateLocale = ["en_US"]`.
  - `title.template = "%s · Ivo Zanacchi"`.
  - `description` orientada a resultados.
  - `alternates.canonical`, `openGraph` (type `profile` / `website`), `twitter: summary_large_image`, `robots`, `icons`.
  - `generateMetadata` por proyecto.
- **OG dinámico:** `app/opengraph-image.tsx` y `app/projects/[id]/opengraph-image.tsx` con `next/og`, sobre la paleta grafito + limón y la captura real del proyecto (base de M2). Tamaño 1200×630.
- **Archivos de rastreo:**
  - `sitemap.ts`: home + 5 proyectos, con `lastModified` desde el contenido.
  - `robots.ts`: `allow: /`, sitemap absoluto.
  - `not-found.tsx` con `noindex`.
- **JSON-LD** (`lib/seo/jsonld.ts`, tipado con `schema-dts`, inyectado con `<script type="application/ld+json">` + nonce):
  - **`Person`:**
    - Identidad: `name`, `jobTitle: "Full-Stack Developer"` (confirmado), `url = SITE_URL`, `image`, `email`, `address` (Tucumán, AR). `inLanguage: "es"`.
    - Perfiles: `sameAs` [LinkedIn, GitHub].
    - Formación: `alumniOf` [UTN FRT, UGR] como `EducationalOrganization`.
    - Credenciales: `hasCredential` ×5 (`EducationalOccupationalCredential`, con emisor y fecha reales).
    - Temas: `knowsAbout` [React, Next.js, TypeScript, FastAPI, Node.js, PostgreSQL, Docker, CI/CD, seguridad web].
  - **`ProfilePage`**, con `mainEntity` apuntando a la Person, y **`WebSite`**.
  - **Proyectos:** un `CreativeWork` por proyecto (`name`, `description`, `image`, `creator`, `keywords` desde el stack, `creativeWorkStatus` PROD/DEV). Estudio Zanacchi suma `url` a su sitio en vivo.
  - **`SoftwareSourceCode` solo si hay un repositorio público real.** Hoy los datos no tienen URLs de repositorio y **no se inventan**: si querés incluirlos, pasame los links.
- **Indexabilidad:** el copy de los 12 capítulos se renderiza en SSR como HTML real (headings jerárquicos: un solo `h1`). El 3D es decorativo (`aria-hidden`) y la información que muestran las pantallas también aparece en el DOM: captions, desafío, solución y stack. Las páginas `/projects/[id]` siguen siendo estáticas e indexables, con galería `next/image` y texto completo.

---

## 6. Ejecución por módulos (stop-and-wait) y Gitflow

**Reglas de cada módulo:**

- Se ejecuta solo con tu confirmación explícita.
- Al cerrar entrego el diff, la verificación (build, lint, tipos y capturas en los tamaños de referencia) y el handoff.
- **No ejecuto ningún comando de Git.** Las ramas, los commits y los PRs los manejás vos.
- **Destino de los PR: `dev`.** Hoy esa rama no existe (§0.1-2).

### M0 — Línea base, dependencias y verificación de Next 16

- **Alcance:** `npm ci`. Lectura obligatoria de `node_modules/next/dist/docs/` (middleware/proxy, metadata, `next/og`, `images`, `headers`). Instalación pineada de las dependencias de §1.5. Script `analyze` y presupuesto de bundle.
- **Archivos:** `package.json` y `package-lock.json` (modificar), `next.config.ts` (envolver con el bundle-analyzer), `docs/next16-notes.md` (crear, con las diferencias verificadas).
- **Calidad:** `next build` + `lint` en verde sin cambios visuales. Medición inicial: Lighthouse del sitio actual como línea base.
- **📦 Handoff:** `chore/m0-baseline-3d-deps` · `chore(deps): add three, r3f and drei pinned; add bundle analyzer` · PR: «Instala el motor 3D pineado y la herramienta de presupuesto de bundle. Sin cambios funcionales. Incluye notas verificadas de Next 16.»

### M1 — Capa de contenido y tipos

- **Alcance:** `content/` (profile, chapters es/en, projects sin `latency`, con `solution` + hotspots, credentials) y `config/site.ts` / `config/chapters.ts` (`CH`, `NAV`, `PMAX = 16.7`). Se elimina la copia de telemetría, topología y terminal. Rol «Full-Stack Developer».
- **Archivos:**
  - Crear: `src/content/*.ts`, `src/config/site.ts`, `src/config/chapters.ts`, `src/types/content.ts`.
  - Modificar: `src/i18n/dictionaries/{es,en}.ts` (podar) y `src/i18n/config.ts` (`DEFAULT_LOCALE = "es"`, confirmado).
  - Deprecar: `src/data/projects.ts`, que se mantiene como re-export temporal hasta M16.
- **Calidad:** tipos estrictos; test de que cada proyecto tiene 3 capturas de showcase con hotspots dentro de `[0,1]`; ninguna cifra sin fuente.
- **📦 Handoff:** `feature/m1-content-layer` · `feat(content): typed content layer for chapters, projects and credentials` · PR: «Centraliza la copia bilingüe y los datos reales (5 proyectos, 52 capturas, 5 certificaciones, UTN y UGR). Elimina métricas no verificables (`latency`, telemetría). Rol actualizado a Full-Stack Developer.»

### M2 — Pipeline de imágenes y texturas

- **Alcance:** `scripts/optimize-assets.mjs` (sharp), derivados AVIF y WebP para el DOM, WebP 2048 para 3D, póster del hero, bases OG y `media-manifest.json`. Limpieza de assets sin uso. **`FullStack.png` reexportado sin DNI.**
- **Archivos:**
  - Crear: `scripts/optimize-assets.mjs`, `src/content/media-manifest.json`, `public/media/**`.
  - Mover: `public/projects/**` → `assets-src/projects/**`.
  - Eliminar: `public/{file,globe,next,vercel,window}.svg`, los 3 `Screenshot 2026-09-06 … .png`, `public/profile/ivodev.JPG` y, más adelante, `public/fonts/shadows-into-light.ttf` (M16).
  - Modificar: `next.config.ts` (quitar Unsplash).
- **Calidad:** peso total servido ≤ 6 MB; ninguna imagen del DOM sin `width` y `height`; verificación visual del certificado sin DNI.
- **📦 Handoff:** `feature/m2-asset-pipeline` · `perf(assets): sharp pipeline for avif/webp derivatives and 3d textures` · PR: «Reduce los 41,6 MB de PNG a derivados responsivos (AVIF y WebP) y texturas 3D dedicadas, con manifiesto de dimensiones. Elimina assets sin uso y el host remoto. Reexporta el certificado sin dato personal.»

### M3 — Sistema de diseño y shell de la app

- **Alcance:** tokens del DESIGN.md en `@theme`, fuentes Schibsted Grotesk y Martian Mono (`next/font`), `layout.tsx` con un solo `<main>`, sin grilla ni cian, foco visible limón y escala tipográfica responsive (clamp + zoom 1,15 / 1,42 en ≥ 1680 / ≥ 2200).
- **Archivos:** modificar `src/app/layout.tsx`, `src/app/globals.css` y `src/app/page.tsx` (sin `<main>` anidado); crear `src/components/ui/{Button,Chip}.tsx`.
- **Calidad:** contraste AA en todos los pares de texto; CLS ≈ 0 con las fuentes (`display: swap` + `adjustFontFallback`).
- **📦 Handoff:** `refactor/m3-design-system-shell` · `refactor(ui): graphite + lemon design tokens and app shell` · PR: «Implementa los tokens del DESIGN.md (paleta, tipografía y bordes ópticos), corrige el landmark `main` duplicado y deja el shell listo para el recorrido 3D.»

### M4 — Motor de scroll y coreografía (sin 3D)

- **Alcance:** `scrollStore`, `useLenisBridge` (un solo bucle), espaciadores por capítulo con anclas, stage sticky aislado, copy DOM con `MotionValue`s, `lib/math` (`ss`, `win`, `damp`, Hermite monótona, resortes) y `reduced motion`.
- **Archivos:**
  - Crear: `src/features/scroll/*`, `src/features/choreography/{keyframes,poses,springs}.ts`, `src/lib/math/*`, `src/views/home/ExperienceShell.tsx`, `src/views/home/chapters/*.tsx`, `src/hooks/usePrefersReducedMotion.ts`.
  - Reescribir: `src/components/providers/SmoothScrollProvider.tsx`.
- **Calidad:** 0 re-renders por scroll (React Profiler); tests de `vitest` sobre la monotonía y la continuidad C¹ de los keyframes (barrido cada 0,01 de `p`, aceleración máxima dentro del umbral medido en el artefacto); el texto se lee completo con JS deshabilitado.
- **📦 Handoff:** `feature/m4-scroll-engine` · `feat(scroll): ref-based lenis bridge and monotone keyframe choreography` · PR: «Motor de scroll sin estado React: Lenis → store mutable → MotionValues y `useFrame`. Keyframes con Hermite monótona y resortes sub-pasados, portados del artefacto, con tests de continuidad.»

### M5 — Stage WebGL (fundación)

- **Alcance:** `<Canvas>` con `next/dynamic` y `ssr: false`, `Suspense` + póster, renderer (ACES, sRGB), entorno PMREM procedural, banco con pozo de luz, `PerformanceMonitor` + DPR adaptativo, tiers de GPU, pausa por IntersectionObserver y visibilidad, `Disposer`, fallback sin WebGL, `FrameDriver` y HUD de desarrollo `?perf`.
- **Archivos:** crear `src/components/three/{Stage,Environment,Bench,FrameDriver,StagePoster}.tsx`, `src/config/quality.ts`, `src/hooks/useVisibilityPause.ts` y `src/lib/three/dispose.ts`.
- **Calidad:** el chunk 3D sale del bundle inicial; el FCP no cambia frente a M3; 20 montajes y desmontajes sin crecimiento de `renderer.info.memory`.
- **📦 Handoff:** `feature/m5-webgl-stage` · `feat(three): lazy webgl stage with adaptive dpr, pause and disposal` · PR: «Stage 3D diferido, sin bloquear FCP ni LCP. DPR adaptativo [1, 1.5], pausa por visibilidad, limpieza completa de VRAM y póster como fallback.»

### M6 — MacBook procedural + hero cenital

- **Alcance:** chasis extruido, teclado instanciado (79 teclas + luces), trackpad, bisagra y tapa sobre el pivote real (elevado), monograma IZ y pantalla `CanvasTexture` por tiers. Hero cenital → giro π → apertura con resorte. Pantallas `boot` y `método`.
- **Archivos:** crear `src/components/macbook/{MacBook,Keyboard,Lid}.tsx`, `src/components/macbook/screens/{boot,method}.ts` y `src/components/three/textures/{useCanvasTexture,screenTiers}.ts`.
- **Calidad:** las teclas no atraviesan la tapa cerrada; IZ legible desde arriba; anisotropía máxima; ≤ 20 draw calls para la Mac.
- **📦 Handoff:** `feature/m6-macbook-hero` · `feat(macbook): procedural macbook with real hinge pivot and top-down hero` · PR: «MacBook plateada procedural con bisagra sobre su eje real, retroiluminación fila por fila y hero cenital con el monograma IZ. Pantallas con resolución por tier.»

### M7 — iPhone Pro + Dynamic Island (3D y navbar)

- **Alcance:**
  - iPhone procedural (titanio, cámaras, botones, UV de pantalla) con isla 3D por resorte.
  - **`DynamicIslandNav`** en el DOM: centrada, 40 px, plegada al bajar y desplegada hacia los costados con 5 links. Viaje animado propio (easeInOutCubic, 0,5–1,7 s) cancelable por el usuario. Foco de teclado, Escape y `aria-expanded`.
  - **Switch de idioma ES | EN** como último elemento de la isla, visible **en ambos estados**:
    - Plegada: anillo · capítulo · [ES|EN].
    - Desplegada: anillo · links · separador · [ES|EN].
    - Es un `<button>` con `aria-label` («Cambiar idioma a English» / «Switch language to Español») y `aria-pressed`. Llama a `setLocale` del `LanguageProvider` y escribe `document.documentElement.lang`. Al cambiar de idioma, el ancho de la isla se recalcula con el mismo resorte.
    - Responsive: en ≤ 440 px se omite «Inicio» (como hoy) y el switch se compacta a un solo botón con el idioma destino («EN» / «ES»). En ≤ 360 px también se omite «Perfil» de la fila desplegada (se llega con el scroll). Objetivo: la fila nunca supera `100vw − 16 px`.
    - Medición en M7 con las 13 resoluciones de referencia.
- **Archivos:** crear `src/components/iphone-island/{IPhonePro.tsx,PhoneScreen.ts,IslandTexture.ts,DynamicIslandNav.tsx,IslandLanguageSwitch.tsx}`; eliminar `src/components/navigation/Navbar.tsx` y `src/components/navigation/LanguageToggle.tsx` (su lógica pasa al switch de la isla).
- **Calidad:** la isla no tapa el texto en ningún tamaño; el tap no abre y cierra en el mismo gesto (solo `focus-visible` despliega); las tres capas de la isla quedan sincronizadas; el switch traduce todo el copy visible (capítulos, isla, captions y pantallas 3D con texto) sin recargar y sin perder la posición de scroll.
- **📦 Handoff:** `feature/m7-iphone-dynamic-island` · `feat(island): iphone pro model and dynamic island navigation` · PR: «iPhone Pro 3D con Dynamic Island viva y navbar isla: se pliega al bajar, se despliega lateralmente al subir y lleva a cada sección con un viaje suave cancelable.»

### M8 — Director de cámara (encuadre automático + dive)

- **Alcance:** `cameraFit` con puntos ponderados, área libre (horizontal o vertical), `setViewOffset`, modo compacto (solo Mac en ≤ 1024 o vertical), niebla relativa a la distancia, «Screen Dive» y `assertExclusion` en desarrollo.
- **Archivos:** crear `src/features/choreography/cameraFit.ts`, `src/components/three/CameraDirector.tsx` y `src/hooks/useViewportProfile.ts`.
- **Calidad:** barrido automático de los 13 tamaños × p ∈ [0, 16,7], sin superposición texto–modelo y con aceleración máxima ≤ el umbral del artefacto.
- **📦 Handoff:** `feature/m8-camera-director` · `feat(camera): auto-fit framing with weighted points and screen dive` · PR: «La cámara encuadra todo lo visible en el área libre de texto en cada tamaño, con entradas y salidas continuas y zona de exclusión verificada.»

### M9 — Capítulo Perfil

- **Alcance:** credencial colgante (cinta, péndulo, giro 180°: frente con perfil, dorso con UTN, UGR y método), 4 módulos de stack (salida → foco → acople; en compacto vuelven a la pantalla), pantalla de perfil con trayectoria 2023–2027 y cifras en el iPhone.
- **Archivos:** crear `src/components/three/{ProfileBadge,StackTiles}.tsx`, `src/components/macbook/screens/profile.ts`, `src/components/iphone-island/screens/profile.ts` y `src/views/home/chapters/Profile.tsx`.
- **Calidad:** los módulos se leen con nitidez (lienzo de 1280×800, anisotropía) y ninguno queda en cuadro al cambiar de capítulo.
- **📦 Handoff:** `feature/m9-profile-chapter` · `feat(profile): hanging id badge, stack tiles and profile screens` · PR: «Capítulo Perfil con credencial 3D, stack en cuatro módulos legibles y cifras reales sincronizadas en Mac, iPhone y DOM.»

### M10 — Capítulo Formación (maletín)

- **Alcance:** maletín procedural (cuero con bump, costuras, latón, cierres con resorte, tapa con rebote, luz interior), vuelo de los 5 certificados (pila → arco → slot → absorción en el rect real de la pantalla), pulso al iPhone, lista accesible sincronizada (`data-on`) y cámara elevada en modo compacto.
- **Archivos:** crear `src/components/three/{Briefcase,CertPlates}.tsx`, `src/features/chapters/certFlight.ts` y `src/views/home/chapters/Formation.tsx`.
- **Calidad:** la tapa del maletín no tapa la pantalla (elevación ≥ 24° en compacto); la absorción coincide al píxel con el rect que dibuja la pantalla.
- **📦 Handoff:** `feature/m10-briefcase-formation` · `feat(formation): 3d briefcase with certification flight` · PR: «Maletín 3D que se abre con el scroll; cada certificado real vuela a la Mac, se verifica y queda registrado en pantalla, iPhone y lista accesible.»

### M11 — Showcases de proyectos + páginas de detalle

- **Alcance:**
  - Tres sub-pantallas por proyecto: transición de página, cursor, hotspots y callouts dentro del ancho de la Mac.
  - Narrativas: Realtime en Nave24, capas en VeeBot, sedes en Estudio, iPhone al frente en Mel, chat pre-cargado en Consultorio.
  - Contraparte móvil en el iPhone.
  - `/projects/[id]` reescrito: galería por pestañas con `next/image` AVIF y WebP, desafío, solución, stack y link en vivo cuando existe.
- **Archivos:** crear `src/components/macbook/screens/shot.ts`, `src/components/three/{Callouts,Pulses,VeeLayers,OfficePins}.tsx`, `src/components/iphone-island/screens/*.ts` y `src/views/home/chapters/Projects.tsx`; reescribir `src/app/projects/[id]/page.tsx` y `src/components/sections/ProjectDetail.tsx` → `src/views/project/ProjectView.tsx`.
- **Calidad:** cada callout apunta a un elemento real de la captura; las capturas se ven nítidas en tier L; LCP del detalle < 2 s.
- **📦 Handoff:** `feature/m11-project-showcases` · `feat(projects): 3d showcases with real screens and indexable detail pages` · PR: «Recorrido por los 5 sistemas con capturas reales, hotspots y narrativa por proyecto. Páginas de detalle indexables con imágenes optimizadas.»

### M12 — Garantías, Contacto y Footer

- **Alcance:** capítulo Garantías (5 etapas reales, pantalla `deploy.sh`), Contacto (email, LinkedIn, GitHub y descarga del CV) y Footer (el selector de idioma vive en la isla, M7).
- **Archivos:** crear `src/views/home/chapters/{Guarantees,Contact}.tsx` y `src/components/macbook/screens/{pipeline,cta}.ts`; reescribir `src/components/navigation/Footer.tsx`; ajustar `ConditionalFooter.tsx`.
- **Calidad:** ninguna afirmación sin respaldo (no se afirman tests automatizados); enlaces externos seguros.
- **📦 Handoff:** `feature/m12-guarantees-contact` · `feat(chapters): guarantees and contact chapters` · PR: «Cierra el recorrido con el proceso de entrega real y un único llamado a la acción.»

### M13 — Móvil y responsive (320 → 2560)

- **Alcance:** hoja inferior en vertical (título + bajada de 2–3 líneas + «Ver detalle» con reencuadre de cámara), compacto en horizontal bajo, listas de 2 columnas en teléfonos chicos, `100dvh` sin alto mínimo fijo y zoom en monitores grandes.
- **Archivos:** crear `src/components/ui/Sheet.tsx`; ajustar `globals.css` y los capítulos; extender `useViewportProfile`.
- **Calidad:** matriz de 13 tamaños (320×568, 375×812, 414×896, 700×900, 768×1024, 844×390, 1024×768, 1280×720, 1280×800, 1366×768, 1440×900, 1920×1080 y 2560×1440): sin scroll horizontal, sin texto sobre los modelos y con la isla siempre centrada.
- **📦 Handoff:** `feature/m13-responsive-compact` · `feat(responsive): compact mobile sheet and per-viewport framing` · PR: «Experiencia completa de 320 a 2560 px: hoja móvil con detalle desplegable, modo compacto con solo Mac y encuadre por tamaño.»

### M14 — Seguridad

- **Alcance:** cabeceras de §5.1, CSP con nonce (siguiendo la convención de Next 16 verificada en M0), script de `scrollRestoration` con nonce y regla de lint para `rel` en enlaces externos.
- **Archivos:** crear `src/lib/security/{csp,headers}.ts` y el archivo de middleware o proxy que corresponda en Next 16; modificar `next.config.ts` y `src/app/layout.tsx`.
- **Calidad:** CSP en modo `Report-Only` durante un ciclo antes de forzarla; cero violaciones con WebGL, `next/image`, `next/og` y fuentes; calificación A+ en un escáner de cabeceras.
- **📦 Handoff:** `feature/m14-security-headers` · `feat(security): strict csp with nonces and hardened http headers` · PR: «CSP estricta compatible con WebGL y cabeceras HSTS, nosniff, DENY, Referrer y Permissions-Policy. Sin dominios de terceros en runtime.»

### M15 — SEO

- **Alcance:** metadata completa, `opengraph-image` (home y por proyecto), `sitemap.ts`, `robots.ts`, `not-found` y JSON-LD (`Person`, `ProfilePage`, `WebSite` y `CreativeWork` ×5).
- **Archivos:** crear `src/lib/seo/{jsonld,metadata}.ts`, `src/app/{opengraph-image,sitemap,robots,not-found}.tsx|ts` y `src/app/projects/[id]/opengraph-image.tsx`; modificar `layout.tsx` y `projects/[id]/page.tsx`.
- **Calidad:** validación del JSON-LD con el Rich Results Test y el validador de schema.org; Lighthouse SEO = 100; un solo `h1`; canonical correcto.
- **📦 Handoff:** `feature/m15-seo-structured-data` · `feat(seo): metadata, dynamic og images, sitemap and json-ld` · PR: «SEO de marca personal: metadata y OG dinámico, sitemap y robots, y datos estructurados Person, ProfilePage y CreativeWork por proyecto. Todo el copy del recorrido es indexable.»

### M16 — QA de rendimiento, accesibilidad y limpieza final

- **Alcance:** eliminación de los componentes legados (§1.3) y del re-export de `data/projects.ts`, medición contra los presupuestos de §2.0, prueba de fugas, auditoría de accesibilidad (foco, `aria`, reduced motion, lector de pantalla), decisión sobre KTX2 y `react-icons`, y actualización de `CLAUDE.md` (regla 5) y del README.
- **Archivos:** eliminar `src/components/sections/*` (salvo lo migrado), `src/components/ui/{ThreeDCard,handwriting-text,rotating-text,morphing-spinner,dot-border-button,vertical-cut-reveal}.tsx`, `public/fonts/shadows-into-light.ttf` y `src/data/projects.ts`; modificar `CLAUDE.md` y `README.md`.
- **Calidad:** informe de rendimiento por dispositivo (frame time p95, draw calls, VRAM y JS gz) y Lighthouse ≥ 95 en Performance, Accessibility, Best Practices y SEO en desktop. En móvil, Performance ≥ 90 sin el chunk 3D en el camino crítico.
- **📦 Handoff:** `chore/m16-perf-qa-cleanup` · `chore: remove legacy sections and verify performance budgets` · PR: «Elimina el código legado y documenta la medición contra los presupuestos (frame time, VRAM, JS, Web Vitals) en los 13 tamaños de referencia.»

---

## Anexo A — Constantes portadas del artefacto (fuente: `Hero.dc.html` v19)

- **Capítulos** (unidades de pantalla): Inicio 0–0,8 · Método 0,8–1,8 · Perfil 1,8–3,4 · Formación 3,4–6,6 · Proyectos (dive) 6,6–7,1 · Nave24 7,1–8,6 · VeeBot 8,6–10,1 · Estudio 10,1–11,6 · Mel 11,6–13,1 · Consultorio 13,1–14,6 · Garantías 14,6–15,8 · Contacto 15,8–16,7. `PMAX = 16.7`.
- **Isla:** links → Inicio 0 · Perfil 2,0 · Formación 3,5 · Proyectos 7,2 · Contacto 16,7. Umbral de dirección ±0,05 pantallas; plegada al bajar y desplegada al subir o con `p < 0,12`.
- **Formación:** `cf = (k − 0,17)/0,15` → cert = `floor(cf − 0,5)`, mc = `floor(cf − 0,8)`. Fases por certificado: subida 0–0,28 · arco 0,28–0,55 · flotar 0,55–0,78 · absorción 0,78–0,95.
- **Perfil:** módulo i → `s0 = 0,14 + 0,13·i`; salida `ss(s0, s0+0,04)`; acople `ss(s0+0,085, s0+0,13)`; regreso antes de k 0,93.

## Anexo B — Matriz de verificación por módulo

| Verificación | M0 | M3 | M4 | M5–M12 | M13 | M14 | M15 | M16 |
|---|---|---|---|---|---|---|---|---|
| `next build` + lint + tipos | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Capturas en 13 tamaños | | ✓ | ✓ | ✓ | ✓ | | | ✓ |
| Barrido de continuidad de cámara | | | ✓ | ✓ | ✓ | | | ✓ |
| `renderer.info` y fugas | | | | ✓ | | | | ✓ |
| Lighthouse y Web Vitals | línea base | ✓ | | ✓ | ✓ | ✓ | ✓ | ✓ |
| Validadores (CSP, JSON-LD) | | | | | | ✓ | ✓ | ✓ |

---

*Plan listo. Quedo a la espera de tu confirmación (y de las decisiones de §0.1) para iniciar el **Módulo 0**.*
