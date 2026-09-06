import type { Dictionary } from "./en";

/**
 * Spanish dictionary. Typed as `Dictionary`, so TypeScript fails the build if a
 * key drifts from `en.ts` — there is no silent runtime fallback.
 *
 * Two deliberate localisation choices, both made to protect the existing layout:
 *  - `hero.roles` uses "PROGRAMADOR" rather than the longer "DESARROLLADOR":
 *    the rotator sits in a fixed `h-[1.15em] overflow-hidden` slot at up to
 *    `text-8xl`, and a 13-character word overflows the column it lives in.
 *  - Command tokens (`help`, `stack`, `contact`…) stay English in both locales:
 *    they are matched by `switch (cleanCmd)` and typed by the user, so they are
 *    identifiers, not copy. Their *output* is fully translated.
 */
export const es: Dictionary = {
  // ── Navbar ────────────────────────────────────────────────────────────────
  nav: {
    architectureLabel: "// ARQUITECTURA",
    architectureAria: "Menú de arquitectura",
    dropdownHeader: "// SPECS DEL CLÚSTER Y TELEMETRÍA",
    ctaPrefix: "INICIAR ",
    ctaCore: "CLI ↵",
    languageAria: "Cambiar idioma",
    languageTitle: "Cambiar a inglés",
    items: {
      stack: { label: "// 01. STACK", description: "Identidad del Ingeniero y Stack" },
      systems: { label: "// 02. SISTEMAS", badge: "PROD", description: "Sistemas Insignia y Despliegues" },
      pipeline: { label: "// 03. PIPELINE", description: "Almacenamiento vectorial y RAG distribuido" },
      topology: { label: "// 04. TOPOLOGÍA", description: "Arquitectura de red y enrutamiento" },
      telemetry: { label: "// 05. TELEMETRÍA", description: "Auditorías de clúster sub-milisegundo" },
      terminal: { label: "// 06. TERMINAL", badge: "CLI", description: "Ejecución interactiva de comandos" },
    },
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    eyebrow: "// ARQUITECTO DE SISTEMAS: IVO ZANACCHI",
    titleLine: "FULL-STACK",
    roles: ["ARQUITECTO", "INGENIERO", "PROGRAMADOR"],
    avatarAlt: "Arquitecto de sistemas",
    description:
      "Soy un apasionado Desarrollador Full-Stack - DevOps radicado en Tucumán, Argentina. Enfocado en construir sistemas resilientes, escalables, sostenibles y eficientes, asegurando la disponibilidad y el rendimiento en entornos reales.",
    ctaInspect: "INSPECCIONAR ARQUITECTURA",
    ctaDownload: "DESCARGAR CV",
    ctaDownloaded: "DESCARGADO ✓",
    scrollHint: "DESPLAZATE",
  },

  // ── TechStackBento ────────────────────────────────────────────────────────
  stack: {
    eyebrow: "// 01. IDENTIDAD DEL INGENIERO Y TOOLCHAIN",
    heading: "Sobre Mí y Lo Que Hago",
    subheading:
      "Sistemas full-stack en React/Vite + TypeScript y Next.js, respaldados por Python FastAPI y Node/Express, diseñados con Claude mediante Spec-Driven Development, entregados vía CI/CD y desplegados en contenedores Docker sobre un VPS.",

    architect: {
      eyebrow: "// 00. EL ARQUITECTO",
      title: "Desarrollador Full-Stack y Arquitecto DevOps",
      location: "Tucumán, Argentina",
      bio: "Soy Ivo Zanacchi. Construyo sistemas full-stack en React.js/Vite + TypeScript y Next.js, respaldados por servicios en Python (FastAPI) y Node.js/Express sobre bases de datos relacionales (PostgreSQL/Supabase, MySQL), no relacionales (MongoDB, Firebase) y vectoriales (Pinecone, para RAG). Todo sistema arranca como una spec: diseño la estructura y la lógica junto con Claude, usando Spec-Driven Development extendido con MCP para contexto de proyecto en vivo y Skills versionados para conocimiento repetible, antes de escribir una sola línea. Una vez testeado, encaro el deploy con un enfoque DevOps que prioriza la estabilidad: contenerizo todo con Docker, lo empaqueto vía CI/CD y lo corro en un VPS o en Render según el proyecto.",
      pillars: ["CÓDIGO LIMPIO", "ARQUITECTURA ESCALABLE", "SPEC-DRIVEN DEVELOPMENT", "CERO REGRESIONES"],
    },

    academic: {
      title: "Base Académica",
      inProgress: "En Curso",
      degrees: {
        cybersecurity: {
          name: "Tecnicatura Universitaria en Ciberseguridad",
          institution: "// UGR",
          period: "MAR 2026 — EN CURSO",
        },
        programming: {
          name: "Técnico Universitario en Programación",
          institution: "// UTN — Facultad Regional Tucumán",
          period: "ABR 2024 — FEB 2027",
        },
      },
    },

    agile: {
      fileName: "agile_readiness.sh",
      title: "Preparación Agile y Scrum",
      bodyBefore: "Construí una base profunda y deliberada en ",
      bodyStrong: "marcos SCRUM y Agile",
      bodyAfter:
        ", no solo las ceremonias, sino la disciplina detrás de ellas. Estoy listo para integrarme desde el día uno al flujo de trabajo de un equipo de ritmo acelerado: comunicación clara, desbloqueo rápido y compromisos de sprint que se cumplen.",
      competenciesLabel: "Competencias Clave",
      competencies: [
        "Planificación de Sprint",
        "Daily Standups",
        "Refinamiento de Backlog",
        "Retrospectivas",
        "Comunicación Asíncrona",
      ],
    },

    terminal: {
      fileName: "ivo_contact.sh",
      copyEmail: "COPIAR EMAIL",
      copied: "COPIADO ✓",
      liveIndicator: "En vivo — esta terminal es interactiva",
      inputAriaLabel: "Terminal de comandos interactiva. Escribí 'help' para ver los comandos disponibles.",
      placeholder: "Escribí un comando...",
      placeholderHints: [
        "Escribí 'help' para ver todos los comandos…",
        "Probá 'contact' para mi email y LinkedIn…",
        "Probá 'resume' para descargar mi CV…",
        "Probá 'stack' para ver todas mis herramientas…",
        "Probá 'github' para mi archivo fuente…",
      ],
      run: "EJECUTAR ↵",
      initCommand: "init --system",
      initOutput: "Sistema inicializado. Escribí 'help' o hacé clic en un comando de abajo.",
      help: "Comandos disponibles: [stack] [experience] [contact] [github] [resume] [clear] [hire]",
      techStack:
        "Frontend: React.js/Vite + TypeScript, Next.js. Backend: Python (FastAPI), Node.js/Express. Bases de datos: PostgreSQL/Supabase, MySQL, MongoDB, Firebase, Pinecone (RAG). Workflow: diseño spec-driven (SDD) asistido por Claude con MCP + Skills, CI/CD, Docker → VPS.",
      experience:
        "Ingeniero de Software Full-Stack y DevOps especializado en arquitecturas sin downtime, plataformas SaaS multi-tenant y auditorías de protocolos de red.",
      emailLabel: "Email:",
      linkedinLabel: "LinkedIn:",
      githubLabel: "Archivo fuente:",
      resume: "CV listo para descargar:",
      hire: (email: string) =>
        `ACCESO CONCEDIDO. Enrutamiento de reclutamiento prioritario activado. Enviá una transmisión a ${email} para iniciar la conversación.`,
      notRecognized: (command: string) =>
        `Comando no reconocido: '${command}'. Escribí 'help' para ver las directivas disponibles.`,
    },

    toolchain: {
      eyebrow: "// ESCANEO DE INTEGRIDAD DEL TOOLCHAIN",
      fileName: "toolchain_scan.sh",
      state: "OK",
      modulesLabel: "MÓDULOS",
      modulesSuffix: "MÓDULOS",
      verified: "VERIFICADO",
      bands: {
        frontend: "// FRONTEND",
        backend: "// BACKEND",
        data: "// DATOS",
        devops: "// DEVOPS",
      },
      footScope: "TOOLCHAIN DE INTEGRACIÓN VERIFICADO",
      footCost: "1 CAPA EN MOVIMIENTO · 0 FRAMES DE JS",
    },

    certifications: {
      label: "Certificaciones y Aprendizaje Continuo",
      items: {
        fullstack: {
          tag: "// FULL-STACK",
          title: "Desarrollo Full-Stack",
          imageAlt: "Certificado de Full Stack Web Developer de DevSchool",
        },
        javascript: {
          tag: "// LENGUAJE",
          title: "JavaScript",
          imageAlt: "Certificado de JavaScript de Coderhouse, certificado por PedidosYa",
        },
        python: {
          tag: "// LENGUAJE",
          title: "Python",
          imageAlt: "Certificado de Python de Coderhouse, certificado por Ualá",
        },
        mobile: {
          tag: "// MÓVIL",
          title: "Desarrollo de Apps Móviles",
          imageAlt: "Certificado de Desarrollo de Aplicaciones de Coderhouse, Top 10, certificado por PedidosYa",
        },
        cybersecurity: {
          tag: "// SEGURIDAD",
          title: "Ciberseguridad",
          imageAlt: "Certificado de Ciberseguridad de Coderhouse, certificado por Binance",
        },
      },
    },
  },

  // ── FeaturedSystems ───────────────────────────────────────────────────────
  systems: {
    eyebrow: "// 02. SISTEMAS INSIGNIA Y ARQUITECTURA",
    heading: "Portafolio",
    inspectMatrix: "INSPECCIONAR SISTEMAS",

    core: {
      eyebrow: "PROYECTOS EN DESARROLLO Y PRODUCCIÓN",
      title: "Sistemas Desarrollados",
      description:
        "Microservicios backend de alta concurrencia, orquestación en contenedores y despliegues impecables sin downtime.",
    },

    parallax: {
      nave24: {
        alt: "Nave24 Stock — pantalla de login de operaciones de depósito",
        caption: "Nave24 Stock // Login de Operaciones",
      },
      veebot: {
        alt: "VeeBot SaaS — panel de selección de candidatos con IA",
        caption: "VeeBot SaaS // Selección de Candidatos con IA",
      },
      estudio: {
        alt: "Estudio Zanacchi — página de inicio del estudio jurídico",
        caption: "Estudio Zanacchi // Sitio del Estudio Jurídico",
      },
      portafolioMel: {
        alt: "Portafolio Mel — página de inicio del portafolio de fotografía",
        caption: "Portafolio Mel // Portafolio de Fotografía",
      },
    },

    matrix: {
      eyebrow: "ESTADO DE SISTEMAS",
      heading: "Desarrollo y Producción",
      systemsLabel: "SISTEMAS:",
      tracked: (count: number) => `${count} MONITOREADOS`,
      prod: (count: number) => `${count} PROD`,
      dev: (count: number) => `${count} DEV`,
      openSystem: "ABRIR SISTEMA",
    },
  },

  // ── EngineeringPipeline ───────────────────────────────────────────────────
  pipeline: {
    eyebrow: "// 03. ARQUITECTURA Y CICLO DE ENTREGA",
    heading: "FLUJO DE TRABAJO.",
    subheading:
      "Desde el diseño spec-driven asistido por IA hasta la arquitectura de la capa de acceso, el aislamiento en contenedores, builds impulsados por CI y despliegues en VPS verificados manualmente: el flujo real detrás de cada sistema entregado.",
    phaseLabel: (phase: string, badge: string) => `FASE // ${phase} — ${badge}`,
    executionProtocol: "[PROTOCOLO DE EJECUCIÓN]",

    stages: {
      spec: {
        badge: "DISEÑO // SPEC-DRIVEN",
        title: "Diseño Spec-Driven Asistido por IA",
        desc: "Las estructuras y la lógica se diseñan de forma colaborativa con Claude antes de escribir una sola línea, fijadas en una spec mediante Spec-Driven Development (SDD) y extendidas con MCP para contexto de proyecto en vivo y módulos de Skills versionados para conocimiento estructurado y repetible.",
      },
      security: {
        badge: "PROTOCOLO // DISEÑO DE ACCESO Y AUTENTICACIÓN",
        title: "Arquitectura de Capa de Acceso y Revisión de Seguridad",
        desc: "Diseño de los límites de sesión y permisos antes de implementar: flujos de tokens JWT/OAuth2 con rotación de access y refresh, y una revisión manual de cada endpoint vinculado a autenticación.",
      },
      docker: {
        badge: "INFRAESTRUCTURA // AISLAMIENTO",
        title: "Contenerización y Entornos Reproducibles",
        desc: "Builds Docker multi-etapa para servicios backend, desplegados a un VPS apenas se pasan todos los tests (VeeBot), y builds de producción optimizados con Turbopack para plataformas frontend (Axon Crafts).",
      },
      cicd: {
        badge: "AUTOMATIZACIÓN // PIPELINES CI",
        title: "Automatización CI y Control Manual de QA",
        desc: "GitHub Actions ejecuta build, type-check y lint en cada push. Una revisión manual de QA sigue siendo el control previo al merge a main, y la cobertura de tests automatizados está en el roadmap, no es algo que afirmemos todavía.",
      },
      edge: {
        badge: "RELEASE // DESPLIEGUE",
        title: "Release sin Downtime y Verificación Manual",
        desc: "Despliegues en VPS dockerizado para servicios backend, despliegues edge instantáneos vía Vercel + Cloudflare para plataformas frontend, verificados manualmente post-release mientras el tooling dedicado de observabilidad sigue en el roadmap.",
      },
    },

    artifacts: {
      spec: {
        claude: "Claude — Diseño Estructural",
        sdd: "Spec-Driven Development (SDD)",
        mcp: "MCP — Protocolo de Contexto Extendido",
        skills: "Skills — Módulos de Conocimiento Estructurado",
      },
      security: {
        jwt: "JWT / OAuth2 — Rotación de Access y Refresh",
        review: "Revisión Manual de Código — Rutas de Auth y Sesión",
      },
      docker: {
        buildComment: "// Build multi-etapa de contenedor de producción",
        deployComment: "// Despliegue en VPS (VeeBot)",
      },
      cicd: {
        build: "Actions — Build",
        typescript: "TypeScript Estricto",
        manualQa: "QA Manual — Pre-Merge",
        pass: "✓ OK",
        checked: "✓ VERIFICADO",
      },
      edge: {
        targets: "Docker // VPS // Vercel Edge + Cloudflare",
        verification: "Verificación Manual Post-Despliegue",
      },
    },
  },

  // ── ArchitectureTopology ──────────────────────────────────────────────────
  topology: {
    eyebrow: "// 04. TOPOLOGÍA DE SISTEMA Y RUTEO DE DATOS",
    heading: "Arquitectura Desacoplada Diseñada para Escalar.",
    subheading:
      "Cada capa está aislada, contenerizada y comunicada de forma asíncrona. Diseñada para evitar puntos únicos de falla manteniendo un throughput de datos sub-milisegundo entre clústeres globales.",
    protocolLabel: "PROTOCOLO:",

    nodes: {
      gateway: {
        layer: "CAPA EDGE // 01",
        title: "Cloudflare Workers y API Gateway",
        protocol: "HTTPS / HTTP3 / SSL",
        status: "SALUDABLE (0.8ms)",
      },
      auth: {
        layer: "SEGURIDAD // 02",
        title: "Servicio JWT y OAuth2 Zero-Trust",
        protocol: "gRPC / mTLS",
        status: "PROTEGIDO",
      },
      core: {
        layer: "CAPA DE CÓMPUTO // 03",
        title: "Microservicios Python FastAPI y Node",
        protocol: "AsyncIO / REST / WS",
        status: "AUTO-ESCALADO (8 PODS)",
      },
      cache: {
        layer: "EN MEMORIA // 04",
        title: "Clúster de Caché Redis Distribuido",
        protocol: "Protocolo RESP",
        status: "TASA DE ACIERTO: 98.4%",
      },
      db: {
        layer: "PERSISTENCIA // 05",
        title: "MongoDB Particionado y PostgreSQL",
        protocol: "TCP / Compatible ACID",
        status: "SINCRONIZADO",
      },
      ai: {
        layer: "MOTOR IA / RAG // 06",
        title: "Pinecone Vector DB y Pipeline RAG",
        protocol: "gRPC / Embeddings Alta Dimensión",
        status: "INDEXADO",
      },
    },
  },

  // ── LiveTelemetryMatrix ───────────────────────────────────────────────────
  telemetry: {
    eyebrow: "// 05. TELEMETRÍA DE PRODUCCIÓN",
    heading: "BENCHMARKS DE RENDIMIENTO VERIFICADOS.",
    streamingLabel: "TRANSMITIENDO TELEMETRÍA EN VIVO DESDE PROD // US-EAST",

    metrics: {
      uptime: {
        label: "UPTIME GLOBAL DEL CLÚSTER",
        badge: "ALTA DISPONIBILIDAD",
        subtext: "Cero caídas no planificadas en 24 meses de despliegues en producción.",
      },
      latency: {
        label: "LATENCIA DEL API GATEWAY",
        badge: "LATENCIA ULTRA BAJA",
        subtext: "Tiempo de respuesta promedio entre las regiones edge de US-East y Sudamérica.",
      },
      concurrency: {
        label: "CAPACIDAD DE THROUGHPUT",
        badge: "CONCURRENCIA",
        subtext: "Conexiones WebSocket simultáneas gestionadas por instancia contenerizada.",
      },
      security: {
        label: "MITIGACIÓN DE VULNERABILIDADES",
        badge: "ENDURECIDO OSI",
        subtext: "Auditorías de seguridad automatizadas en CI/CD y aplicación de protocolos zero-trust.",
      },
    },
  },

  // ── ProjectDetail ─────────────────────────────────────────────────────────
  projectDetail: {
    backToMatrix: "VOLVER",
    returnToMatrix: "< VOLVER",
    live: "EN VIVO",
    building: "EN CONSTRUCCIÓN",
    deployStatusLabel: "ESTADO DEL DEPLOY:",
    latencyLabel: "LATENCIA:",
    architectureLabel: "ARQUITECTURA:",
    challengeHeading: "// EL DESAFÍO",
    scopeHeading: "// ALCANCE Y SOLUCIÓN",
    featuresHeading: "// ARQUITECTURA Y FUNCIONALIDADES",
    initializeLive: "INICIAR SISTEMA EN VIVO",

    terminal: {
      fileName: (id: string) => `deploy.sh — ${id}`,
      deployCommand: (target: string) => `$ deploy --target=${target}`,
      provisioning: (architecture: string) => `Aprovisionando servicios ${architecture}...`,
      stack: (stack: string) => `Stack: ${stack}`,
      healthCheck: "Chequeo de salud... ",
      latencyProbe: "Sonda de latencia: ",
      stable: "Despliegue estable",
      stagingReady: "Build de staging listo",
    },
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    badges: {
      cluster: "SYS_ARCH // CLÚSTER 100/100",
      diagnostic: "DIAGNÓSTICO CAD: LISTO PARA ESCANEO",
      protocol: "PROTOCOLO CERO REGRESIONES",
    },
    watermarkLegend: "// ARQUITECTURA SIN CONCESIONES //",
    watermarkHint: "[PASÁ EL CURSOR PARA EJECUTAR EL ESCANEO]",

    ticker: {
      operational: "TODOS LOS CLÚSTERES OPERATIVOS // EDGE GLOBAL",
      latencyLabel: "LATENCIA:",
      uptimeLabel: "UPTIME:",
      locationLabel: "UBICACIÓN:",
      locationValue: "SALTA, AR // UTC-3",
      buildLabel: "BUILD:",
    },

    brandName: "IVO ZANACCHI",
    philosophy:
      "Ingeniería de microservicios backend de alta concurrencia, infraestructura cloud resiliente y aplicaciones web ultra fluidas. Construido para cero regresiones y máxima escalabilidad.",
    availability: "DISPONIBLE PARA COLABORACIONES DE INGENIERÍA DE ALTO NIVEL.",

    modulesHeading: "// MÓDULOS DEL SISTEMA",
    modules: {
      stack: "01. STACK DE ARQUITECTURA",
      systems: "02. SISTEMAS INSIGNIA",
      pipeline: "03. PIPELINE DE EJECUCIÓN",
      topology: "04. TOPOLOGÍA DEL SISTEMA",
      telemetry: "05. TELEMETRÍA EN VIVO",
      terminal: "06. TERMINAL CLI",
    },

    channelsHeading: "// CANALES DE TRANSMISIÓN",
    channels: {
      github: "PROTOCOLO GITHUB",
      linkedin: "RED LINKEDIN",
      email: "CIFRADO DIRECTO (EMAIL)",
      emailAction: "→ INICIAR",
      whatsapp: "CANAL SEGURO (WHATSAPP)",
      whatsappAction: "→ INICIAR",
    },

    copyright: (year: number) => `© ${year} IVO ZANACCHI. TODOS LOS DERECHOS RESERVADOS.`,
    builtWith: "CONSTRUIDO CON NEXT.JS 16 // FRAMER MOTION // TAILWIND CSS",
  },
};
