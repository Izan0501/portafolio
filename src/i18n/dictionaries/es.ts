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
      stack: { label: "// 01. STACK" },
      systems: { label: "// 02. SISTEMAS", badge: "PROD" },
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
      "Desarrollador Full-Stack y Arquitecto DevOps radicado en Tucumán, Argentina — enfocado en construir sistemas resilientes que aguantan carga real.",
    ctaResume: "DESCARGAR CV",
    ctaInspect: "INSPECCIONAR ARQUITECTURA",
  },

  // ── TechStackBento ────────────────────────────────────────────────────────
  stack: {
    eyebrow: "// 01. IDENTIDAD DEL INGENIERO Y TOOLCHAIN",
    heading: "Arquitectura y Ejecución",
    subheading:
      "Un enfoque implacable en sistemas resilientes, integración continua y colaboración profunda dentro de marcos Agile estándar de la industria.",

    architect: {
      eyebrow: "// 00. EL ARQUITECTO",
      title: "Desarrollador Full-Stack y Arquitecto DevOps",
      location: "Tucumán, Argentina",
      bio: "Soy Ivo Zanacchi. Construyo sistemas como me gustaría heredarlos: limpios, documentados y aburridos en el mejor sentido — infraestructura que escala sin parches, y revisiones de código que no necesitan traductor. Mi foco es la entrega sin regresiones: cada deploy debería ser rutina, cada rollback debería ser innecesario, y cada servicio debería seguir teniendo sentido al leerlo seis meses después.",
      pillars: ["CÓDIGO LIMPIO", "ARQUITECTURA ESCALABLE", "CERO REGRESIONES"],
    },

    academic: {
      title: "Base Académica",
      inProgress: "En Curso",
      degrees: {
        cybersecurity: {
          name: "Tecnicatura Universitaria en Ciberseguridad",
          institution: "// UGR",
        },
        programming: {
          name: "Técnico Universitario en Programación",
          institution: "// UTN — Facultad Regional Tucumán",
        },
      },
    },

    agile: {
      fileName: "agile_readiness.sh",
      title: "Preparación Agile y Scrum",
      bodyBefore: "Construí una base profunda y deliberada en ",
      bodyStrong: "marcos SCRUM y Agile",
      bodyAfter:
        " — no solo las ceremonias, sino la disciplina detrás de ellas. Estoy listo para integrarme desde el día uno al flujo de trabajo de un equipo de ritmo acelerado: comunicación clara, desbloqueo rápido y compromisos de sprint que se cumplen.",
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
      placeholder: "Escribí un comando...",
      run: "EJECUTAR ↵",
      initCommand: "init --system",
      initOutput: "Sistema inicializado. Escribí 'help' o hacé clic en un comando de abajo.",
      help: "Comandos disponibles: [stack] [experience] [contact] [github] [resume] [clear] [hire]",
      techStack:
        "Backend: Python (FastAPI), Node.js, TypeScript. DevOps: Docker, Kubernetes, CI/CD, AWS. Bases de datos: MongoDB, PostgreSQL, Pinecone RAG.",
      experience:
        "Ingeniero de Software Full-Stack y DevOps especializado en arquitecturas sin downtime, plataformas SaaS multi-tenant y auditorías de protocolos de red.",
      emailLabel: "Email:",
      linkedinLabel: "LinkedIn:",
      githubLabel: "Archivo fuente:",
      resume: "El CV todavía no está subido a este build — usá 'contact' para solicitarlo directamente.",
      hire: (email: string) =>
        `ACCESO CONCEDIDO. Enrutamiento de reclutamiento prioritario activado — enviá una transmisión a ${email} para iniciar la conversación.`,
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
    heading: "Arquitectura en Producción",
    inspectMatrix: "INSPECCIONAR MATRIZ DE DESPLIEGUE",

    core: {
      eyebrow: "// NÚCLEO CENTRAL DEL CLÚSTER",
      title: "Cero Regresiones",
      description:
        "Microservicios backend de alta concurrencia, orquestación en contenedores y enrutamiento edge sub-milisegundo.",
    },

    parallax: {
      veebot: {
        alt: "VeeBot SaaS v2.4 / Motor OCR automatizado",
        caption: "VeeBot SaaS // Motor de PDF y Reservas",
      },
      axon: {
        alt: "Ecosistema de agencia Axon Crafts",
        caption: "Axon Crafts // Plataforma nivel Silicon Valley",
      },
      threatMap: {
        alt: "Mapa de amenazas cibernéticas en tiempo real",
        caption: "Cyber Threat Map // Telemetría TCP/IP",
      },
      pinecone: {
        alt: "Clúster vectorial Pinecone RAG",
        caption: "Pinecone RAG // Base vectorial distribuida",
      },
      badge: "PROD",
    },

    matrix: {
      eyebrow: "// REGISTRO DE AUDITORÍA: ESTADO DE SISTEMAS EN PRODUCCIÓN",
      heading: "Matriz de Despliegue",
      systemsLabel: "SISTEMAS:",
      tracked: (count: number) => `${count} MONITOREADOS`,
      prod: (count: number) => `${count} PROD`,
      dev: (count: number) => `${count} DEV`,
    },
  },

  // ── EngineeringPipeline ───────────────────────────────────────────────────
  pipeline: {
    eyebrow: "// 03. ARQUITECTURA Y CICLO DE ENTREGA",
    heading: "EL CICLO DE VIDA DE INGENIERÍA.",
    subheading:
      "Desde la arquitectura de la capa de acceso y el aislamiento en contenedores hasta builds impulsados por CI y despliegues verificados manualmente — el flujo real detrás de cada sistema entregado.",
    phaseLabel: (phase: string, badge: string) => `FASE // ${phase} — ${badge}`,
    executionProtocol: "[PROTOCOLO DE EJECUCIÓN]",

    stages: {
      security: {
        badge: "PROTOCOLO // DISEÑO DE ACCESO Y AUTENTICACIÓN",
        title: "Arquitectura de Capa de Acceso y Revisión de Seguridad",
        desc: "Diseño de los límites de sesión y permisos antes de implementar — flujos de tokens JWT/OAuth2 con rotación de access y refresh, y una revisión manual de cada endpoint vinculado a autenticación.",
      },
      docker: {
        badge: "INFRAESTRUCTURA // AISLAMIENTO",
        title: "Contenerización y Entornos Reproducibles",
        desc: "Builds Docker multi-etapa con escalado sobre Swarm para servicios backend (VeeBot), y builds de producción optimizados con Turbopack para plataformas frontend (Axon Crafts).",
      },
      cicd: {
        badge: "AUTOMATIZACIÓN // PIPELINES CI",
        title: "Automatización CI y Control Manual de QA",
        desc: "GitHub Actions ejecuta build, type-check y lint en cada push. Una revisión manual de QA sigue siendo el control previo al merge a main — la cobertura de tests automatizados está en el roadmap, no es algo que afirmemos todavía.",
      },
      edge: {
        badge: "RELEASE // DESPLIEGUE",
        title: "Release sin Downtime y Verificación Manual",
        desc: "Despliegues rolling sobre Swarm en AWS para servicios backend, despliegues edge instantáneos vía Vercel + Cloudflare para plataformas frontend — verificados manualmente post-release mientras el tooling dedicado de observabilidad sigue en el roadmap.",
      },
    },

    artifacts: {
      security: {
        jwt: "JWT / OAuth2 — Rotación de Access y Refresh",
        review: "Revisión Manual de Código — Rutas de Auth y Sesión",
      },
      docker: {
        buildComment: "// Build multi-etapa de contenedor de producción",
        swarmComment: "// Escalado en Swarm (VeeBot)",
      },
      cicd: {
        build: "Actions — Build",
        typescript: "TypeScript Estricto",
        manualQa: "QA Manual — Pre-Merge",
        pass: "✓ OK",
        checked: "✓ VERIFICADO",
      },
      edge: {
        targets: "AWS Docker Swarm // Vercel Edge + Cloudflare",
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
    backToMatrix: "VOLVER A LA MATRIZ",
    returnToMatrix: "< VOLVER A LA MATRIZ",
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
    },

    copyright: (year: number) => `© ${year} IVO ZANACCHI. TODOS LOS DERECHOS RESERVADOS.`,
    builtWith: "CONSTRUIDO CON NEXT.JS 16 // FRAMER MOTION // TAILWIND CSS",
  },
};
