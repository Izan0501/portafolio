# Referencia de diseño — Artefacto A «Banco de pruebas» (v19, aprobado)

Esta carpeta **no es código de la app**: es la fuente de verdad visual y de comportamiento que porta el `IMPLEMENTATION_PLAN.md`. No se importa, no se compila y no se despliega.

| Archivo | Qué es |
|---|---|
| `Hero.dc.html` | Prototipo completo e interactivo en three.js imperativo (r186). Contiene toda la coreografía, las constantes, los materiales, el encuadre automático (`_fitCam`), los keyframes monótonos (`_keyTangents`, `_poseAt`, `_mono`), los resortes (`_sp`, `_spring`), las pantallas Canvas2D (`_drawMac`, `_drawPhone`, `_phProf`, `_phCase`), el maletín (`_buildCase`, `_certs`), la credencial (`_buildBadge`, `_drawBadge`), los módulos de stack (`_buildTiles`, `_profile`), los callouts (`_callouts`), la Dynamic Island DOM (`_islOpen`, `_scrollDir`, `_scrollTo`) y todo el copy es de los 12 capítulos, con su CSS responsive. |
| `DESIGN.dc.html` | DESIGN.md del artefacto: diagnóstico, paleta, tipografía, materiales y reglas. |
| `Storyboard.dc.html` | Mapa de capítulos (rangos de scroll), módulos y handoffs de diseño. |
| `Responsive.dc.html` | Reglas responsive. Las capturas referencian assets del artefacto y no se ven fuera de él. |

## Cómo leer `Hero.dc.html`

- Es formato «design canvas»: el HTML va dentro de `<x-dc>`, el CSS dentro de `<helmet><style>` y la lógica en `<script type="text/x-dc">` como `class Component extends DCLogic`.
- `{{ref_x}}` y `onClick="{{goN}}"` son bindings del canvas. En React equivalen a `ref` y `onClick`.
- Los métodos con prefijo `_build*` crean geometría (equivale al montaje de componentes R3F). `_frame` es el bucle (equivale a `useFrame`). `_dom` escribe la UI por refs (equivale a escrituras por ref y MotionValues; nunca `setState`).
- Unidades: el scroll se mide en pantallas (`p = scrollTop / viewportHeight`), con `PMAX = 16.7`.

## Mapa de assets (`/_blob/<id>` del artefacto → archivo real del repo)

Verificado por comparación de miniaturas (diferencia media ≈ 0 en todos; la foto es un recorte cuadrado).

| Clave en `Hero.dc.html` | Archivo del repo |
|---|---|
| `nave_dash` | `public/projects/nave24stock/stock-dash.png` |
| `nave_inv` | `public/projects/nave24stock/stock-inventory.png` |
| `nave_sales` | `public/projects/nave24stock/stock-sales.png` |
| `vee_dash` | `public/projects/veeBot/bot-dash.png` |
| `vee_twin` | `public/projects/veeBot/bot-DigitalTwins-1.png` |
| `vee_vs` | `public/projects/veeBot/bot-comparator2.png` |
| `est_hero` | `public/projects/estudio/estudio-back.png` |
| `est_areas` | `public/projects/estudio/estudio-areas.png` |
| `est_intake` | `public/projects/estudio/estudio-contacto-2.png` |
| `mel_hero` | `public/projects/portafolio-mel/portafolio-back.png` |
| `mel_slider` | `public/projects/portafolio-mel/portafolio-hoverSlider.png` |
| `mel_gal` | `public/projects/portafolio-mel/portafolio-carousel-1.png` |
| `con_hero` | `public/projects/consultorio/consul-back.png` |
| `con_trat` | `public/projects/consultorio/consul-tratamientos.png` |
| `con_orto` | `public/projects/consultorio/consul-ortInvisible.png` |
| `ivo` | `public/profile/ivodev.jpeg` (recorte cuadrado centrado) |
| `c_full` | `public/projects/certifications/FullStack.png`. **La copia del artefacto tiene el DNI tapado y el original del repo no** (ver plan §0.1-6). |
| `c_py` · `c_apps` · `c_js` · `c_sec` | `public/projects/certifications/python.jpeg` · `AppsDev.jpeg` · `JS.jpeg` · `CiberSeg.jpeg` |
| `a832cd51…` (script) | three.js r186 (en la app se reemplaza por el paquete npm `three`) |

## Diferencias aprobadas que la app debe incorporar (posteriores a algunas notas internas del prototipo)

- Rol «Full-Stack Developer» (sin DevOps); Docker y CI/CD como parte de la entrega.
- Idioma por defecto **es**, con switch ES | EN dentro de la Dynamic Island (la isla del prototipo todavía no lo tiene).
- Sin panel de rendimiento (FPS) visible, sin regla en el banco y sin barra de progreso inferior.
- Isla siempre centrada; plegada al bajar; desplegada solo hacia los costados (40 px de alto) con 5 links.
