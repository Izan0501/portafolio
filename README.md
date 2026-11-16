# portafolio_dev

Portfolio personal de Ivo Zanacchi — un recorrido 3D de scroll continuo (una MacBook y un iPhone procedurales, animados con Three.js/React Three Fiber) acompañado de contenido real (texto, proyectos, certificaciones) totalmente indexable en el DOM.

## Stack

- **Next.js 16** (App Router, Turbopack), React 19, TypeScript estricto.
- **Three.js + @react-three/fiber + @react-three/drei** — la MacBook/iPhone procedurales y la dirección de cámara, cargados en diferido (`next/dynamic`, `ssr:false`) para que nunca entren en el bundle inicial.
- **Tailwind v4** (CSS-first, `@theme`) + CSS puro para las animaciones/responsive del recorrido (`globals.css`).
- **Motion** (`motion/react`, `LazyMotion`) para el copy DOM sincronizado con scroll.
- **Lenis** para el scroll suave — un único loop de animación compartido con el `Canvas` (`FrameDriver`).
- **`schema-dts`** para el JSON-LD tipado (`Person`, `ProfilePage`, `WebSite`, `CreativeWork` por proyecto).

## Scripts

```bash
npm run dev              # servidor de desarrollo (Turbopack)
npm run build             # build de producción
npm run start              # sirve el build de producción
npm run lint               # eslint
npm run test                # vitest (funciones puras de choreography/scroll/seo/security)
npm run analyze              # build con @next/bundle-analyzer
npm run optimize-assets       # pipeline sharp (AVIF/WebP) sobre assets-src/
```

## Variables de entorno

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Dominio propio, si existe. Sin esta variable, `SITE_URL` cae a la URL de producción de Vercel y, en local, a `http://localhost:3000`. |
| `ANALYZE` | `true` activa `@next/bundle-analyzer` en `next.config.ts`. |

La Content-Security-Policy (`src/lib/security/csp.ts`) está activa (bloqueante) por defecto — `script-src` usa `'unsafe-inline'` en vez de un nonce para que `/` y `/projects/[id]` sigan siendo estáticas (un nonce real fuerza SSR dinámico en Next 16).

## Estructura

- `src/content/` — los datos reales del portfolio (proyectos, certificaciones, perfil, copy bilingüe es/en).
- `src/views/home/` — el recorrido 3D: `ExperienceShell.tsx` + un componente por capítulo.
- `src/components/three/` — la escena (Stage, cámara, MacBook, iPhone, materiales, texturas).
- `src/features/` — scroll (`scrollStore`, sin React), coreografía (keyframes/springs/cameraFit) y lógica por capítulo — todo puro y testeado.
- `src/lib/` — SEO (JSON-LD, metadata) y seguridad (CSP, cabeceras HTTP).
- `docs/next16-notes.md` — hallazgos verificados de la API real de Next 16 (middleware/proxy, CSP, metadata, `next/og`) contra `node_modules/next/dist/docs/`, no de memoria.
- `IMPLEMENTATION_PLAN.md` — el plan completo de rediseño que este repo ejecutó módulo por módulo.

## Deploy

Pensado para Vercel (`vercel.com/new`), sin configuración adicional más allá de las variables de entorno de arriba.
