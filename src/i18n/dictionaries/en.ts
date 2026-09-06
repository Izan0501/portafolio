/**
 * English dictionary — the source of truth for the shape of every other locale.
 *
 * `Dictionary` is derived from this object (`typeof en`), so `es.ts` is checked
 * against it at compile time: a missing or misspelled key is a build error, not
 * a silent fallback to English at runtime.
 *
 * Values that interpolate runtime data are functions rather than templates with
 * placeholder tokens — that keeps interpolation type-safe and avoids a parser.
 */
export const en = {
  // ── Navbar ────────────────────────────────────────────────────────────────
  nav: {
    architectureLabel: "// ARCHITECTURE",
    architectureAria: "Architecture menu",
    dropdownHeader: "// CLUSTER SPECS & TELEMETRY",
    ctaPrefix: "INITIATE ",
    ctaCore: "CLI ↵",
    languageAria: "Switch language",
    languageTitle: "Switch to Spanish",
    items: {
      stack: { label: "// 01. STACK", description: "Engineer Identity & Toolchain" },
      systems: { label: "// 02. SYSTEMS", badge: "PROD", description: "Flagship Systems & Deployments" },
      pipeline: { label: "// 03. PIPELINE", description: "Distributed RAG & Vector Storage" },
      topology: { label: "// 04. TOPOLOGY", description: "Network Architecture & Routing" },
      telemetry: { label: "// 05. TELEMETRY", description: "Sub-millisecond Cluster Audits" },
      terminal: { label: "// 06. TERMINAL", badge: "CLI", description: "Interactive Command Execution" },
    },
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    eyebrow: "// SYSTEM ARCHITECT: IVO ZANACCHI",
    titleLine: "FULL-STACK",
    roles: ["ARCHITECT", "ENGINEER", "DEVELOPER"],
    avatarAlt: "System Architect",
    description:
      "I'm a passionate Full-Stack and DevOps Developer based in Tucumán, Argentina. Focused on building resilient, scalable, sustainable, and efficient systems, ensuring availability and performance in real-world environments.",
    ctaInspect: "INSPECT ARCHITECTURE",
    ctaDownload: "DOWNLOAD CV",
    ctaDownloaded: "DOWNLOADED ✓",
    scrollHint: "SCROLL",
  },

  // ── TechStackBento (identity, academics, agile, terminal, toolchain) ────────
  stack: {
    eyebrow: "// 01. ENGINEER IDENTITY & TOOLCHAIN",
    heading: "About Me and What I Do",
    subheading:
      "Full-stack systems on React/Vite + TypeScript and Next.js, backed by Python FastAPI and Node/Express, designed with Claude through Spec-Driven Development, shipped via CI/CD, and deployed in Docker containers on a VPS.",

    architect: {
      eyebrow: "// 00. THE ARCHITECT",
      title: "Full-Stack Developer & DevOps Architect",
      location: "Tucumán, Argentina",
      bio: "I'm Ivo Zanacchi. I build full-stack systems on React.js/Vite + TypeScript and Next.js, backed by Python (FastAPI) and Node.js/Express services across relational (PostgreSQL/Supabase, MySQL), non-relational (MongoDB, Firebase), and vector (Pinecone, for RAG) databases. Every system starts as a spec: I design the structure and logic with Claude, using Spec-Driven Development extended with MCP for live project context and versioned Skills for repeatable knowledge, before a single line ships. Once it's tested, I containerize it with Docker and deploy it to a VPS through CI/CD. My focus is zero-regression delivery: every deploy should be routine, every rollback should be unnecessary, and every service should still make sense to read six months from now.",
      pillars: ["CLEAN CODE", "SCALABLE ARCHITECTURE", "SPEC-DRIVEN DEVELOPMENT", "ZERO-REGRESSION"],
    },

    academic: {
      title: "Academic Core",
      inProgress: "In Progress",
      degrees: {
        cybersecurity: {
          name: "University Technical Degree in Cybersecurity",
          institution: "// UGR",
          period: "MAR 2026 — ONGOING",
        },
        programming: {
          name: "University Technician in Programming",
          institution: "// UTN — Tucumán Regional Faculty",
          period: "APR 2024 — FEB 2027",
        },
      },
    },

    agile: {
      fileName: "agile_readiness.sh",
      title: "Agile & Scrum Readiness",
      bodyBefore: "I've built a deep, deliberate foundation in ",
      bodyStrong: "SCRUM and Agile frameworks",
      bodyAfter:
        ", not just the ceremonies, but the discipline behind them. I'm ready to drop into a fast-paced team's existing workflow from day one: clear communication, rapid unblocking, and sprint commitments that get kept.",
      competenciesLabel: "Core Competencies",
      competencies: [
        "Sprint Planning",
        "Daily Standups",
        "Backlog Grooming",
        "Retrospectives",
        "Async Communication",
      ],
    },

    terminal: {
      fileName: "ivo_contact.sh",
      copyEmail: "COPY EMAIL",
      copied: "COPIED ✓",
      liveIndicator: "Live — this terminal is interactive",
      inputAriaLabel: "Interactive command terminal. Type 'help' to see available commands.",
      placeholder: "Type a command...",
      // Cycled in the input's placeholder while it's empty and unfocused — the
      // terminal's real teaching surface, since the chips below only show the
      // command name, not what it's for.
      placeholderHints: [
        "Type 'help' to see every command…",
        "Try 'contact' for my email & LinkedIn…",
        "Try 'resume' to download my CV…",
        "Try 'stack' for my full toolset…",
        "Try 'github' for my source archive…",
      ],
      run: "RUN ↵",
      initCommand: "init --system",
      initOutput: "System initialized. Type 'help' or click a command chip below.",
      help: "Available commands: [stack] [experience] [contact] [github] [resume] [clear] [hire]",
      techStack:
        "Frontend: React.js/Vite + TypeScript, Next.js. Backend: Python (FastAPI), Node.js/Express. DBs: PostgreSQL/Supabase, MySQL, MongoDB, Firebase, Pinecone (RAG). Workflow: Claude-assisted spec-driven design (SDD) with MCP + Skills, CI/CD, Docker → VPS.",
      experience:
        "Full-Stack Software Engineer & DevOps specializing in zero-downtime architectures, multi-tenant SaaS platforms, and network protocol audits.",
      emailLabel: "Email:",
      linkedinLabel: "LinkedIn:",
      githubLabel: "Source archive:",
      resume: "Resume artifact ready for download:",
      hire: (email: string) =>
        `ACCESS GRANTED. High-priority recruitment routing activated. Send a transmission to ${email} to initiate contract discussions.`,
      notRecognized: (command: string) =>
        `Command not recognized: '${command}'. Type 'help' for available directives.`,
    },

    toolchain: {
      eyebrow: "// TOOLCHAIN INTEGRITY SCAN",
      fileName: "toolchain_scan.sh",
      state: "PASS",
      modulesLabel: "MODULES",
      modulesSuffix: "MODULES",
      verified: "VERIFIED",
      bands: {
        frontend: "// FRONTEND",
        backend: "// BACKEND",
        data: "// DATA",
        devops: "// DEVOPS",
      },
      footScope: "VERIFIED INTEGRATION TOOLCHAIN",
      footCost: "1 TRANSLATING LAYER · 0 JS FRAMES",
    },

    certifications: {
      label: "Certifications & Continuous Learning",
      items: {
        fullstack: {
          tag: "// FULL-STACK",
          title: "Full-Stack Development",
          imageAlt: "Full Stack Web Developer certificate from DevSchool",
        },
        javascript: {
          tag: "// LANGUAGE",
          title: "JavaScript",
          imageAlt: "JavaScript certificate from Coderhouse, certified by PedidosYa",
        },
        python: {
          tag: "// LANGUAGE",
          title: "Python",
          imageAlt: "Python certificate from Coderhouse, certified by Ualá",
        },
        mobile: {
          tag: "// MOBILE",
          title: "Mobile App Development",
          imageAlt: "App Development certificate from Coderhouse, Top 10, certified by PedidosYa",
        },
        cybersecurity: {
          tag: "// SECURITY",
          title: "Cybersecurity",
          imageAlt: "Cybersecurity certificate from Coderhouse, certified by Binance",
        },
      },
    },
  },

  // ── FeaturedSystems ───────────────────────────────────────────────────────
  systems: {
    eyebrow: "// 02. FLAGSHIP SYSTEMS & ARCHITECTURE",
    heading: "Portfolio",
    inspectMatrix: "INSPECT SYSTEMS",

    core: {
      eyebrow: "PROJECTS IN DEVELOPMENT AND PRODUCTION",
      title: "Developed Systems",
      description:
        "High-concurrency backend microservices, containerized orchestration, and flawless, zero-downtime deployments.",
    },

    parallax: {
      nave24: {
        alt: "Nave24 Stock — warehouse operations login screen",
        caption: "Nave24 Stock // Warehouse Ops Login",
      },
      veebot: {
        alt: "VeeBot SaaS — AI resume screening dashboard",
        caption: "VeeBot SaaS // AI Resume Screening",
      },
      estudio: {
        alt: "Estudio Zanacchi — legal practice homepage",
        caption: "Estudio Zanacchi // Legal Practice Site",
      },
      portafolioMel: {
        alt: "Portafolio Mel — photography portfolio homepage",
        caption: "Portafolio Mel // Photography Portfolio",
      },
    },

    matrix: {
      eyebrow: "SYSTEMS STATUS",
      heading: "Development and Production",
      systemsLabel: "SYSTEMS:",
      tracked: (count: number) => `${count} TRACKED`,
      prod: (count: number) => `${count} PROD`,
      dev: (count: number) => `${count} DEV`,
      openSystem: "OPEN SYSTEM",
    },
  },

  // ── EngineeringPipeline ───────────────────────────────────────────────────
  pipeline: {
    eyebrow: "// 03. ARCHITECTURE & DELIVERY LIFECYCLE",
    heading: "WORKFLOW.",
    subheading:
      "From AI-assisted, spec-driven design to access-layer architecture, container isolation, CI-driven builds, and manually verified VPS deployments: the real workflow behind every shipped system.",
    phaseLabel: (phase: string, badge: string) => `PHASE // ${phase} — ${badge}`,
    executionProtocol: "[EXECUTION PROTOCOL]",

    stages: {
      spec: {
        badge: "DESIGN // SPEC-DRIVEN",
        title: "AI-Assisted Spec-Driven Design",
        desc: "Structures and logic are designed collaboratively with Claude before a single line ships, locked into a spec via Spec-Driven Development (SDD) and extended with MCP for live project context and versioned Skills modules for repeatable, structured knowledge.",
      },
      security: {
        badge: "PROTOCOL // ACCESS & AUTH DESIGN",
        title: "Access-Layer Architecture & Security Review",
        desc: "Designing session and permission boundaries before implementation: JWT/OAuth2 token flows with access & refresh rotation, and a manual review pass on every auth-adjacent endpoint.",
      },
      docker: {
        badge: "INFRASTRUCTURE // ISOLATION",
        title: "Containerization & Reproducible Environments",
        desc: "Multi-stage Docker builds for backend services, shipped to a VPS once every test passes (VeeBot), and Turbopack-optimized production builds for frontend platforms (Axon Crafts).",
      },
      cicd: {
        badge: "AUTOMATION // CI PIPELINES",
        title: "CI Automation & Manual QA Gate",
        desc: "GitHub Actions runs build, type-check, and lint on every push. A manual QA pass is still the gate before merging to main, and automated test coverage is on the roadmap rather than a claim we make yet.",
      },
      edge: {
        badge: "RELEASE // DEPLOYMENT",
        title: "Zero-Downtime Release & Manual Verification",
        desc: "Dockerized VPS deploys for backend services, instant edge deploys via Vercel + Cloudflare for frontend platforms, verified manually post-release while dedicated observability tooling is still on the roadmap.",
      },
    },

    artifacts: {
      spec: {
        claude: "Claude — Structural Design",
        sdd: "Spec-Driven Development (SDD)",
        mcp: "MCP — Extended Context Protocol",
        skills: "Skills — Structured Knowledge Modules",
      },
      security: {
        jwt: "JWT / OAuth2 — Access & Refresh Rotation",
        review: "Manual Code Review — Auth & Session Paths",
      },
      docker: {
        buildComment: "// Multi-stage production container build",
        deployComment: "// VPS deploy (VeeBot)",
      },
      cicd: {
        build: "Actions — Build",
        typescript: "TypeScript Strict",
        manualQa: "Manual QA — Pre-Merge",
        pass: "✓ PASS",
        checked: "✓ CHECKED",
      },
      edge: {
        targets: "Docker // VPS // Vercel Edge + Cloudflare",
        verification: "Manual Post-Deploy Verification",
      },
    },
  },

  // ── ArchitectureTopology ──────────────────────────────────────────────────
  topology: {
    eyebrow: "// 04. SYSTEM TOPOLOGY & DATA ROUTING",
    heading: "Decoupled Architecture Engineered for Scale.",
    subheading:
      "Every layer is isolated, containerized, and asynchronously communicated. Designed to prevent single points of failure while maintaining sub-millisecond data throughput across global clusters.",
    protocolLabel: "PROTOCOL:",

    nodes: {
      gateway: {
        layer: "EDGE LAYER // 01",
        title: "Cloudflare Workers & API Gateway",
        protocol: "HTTPS / HTTP3 / SSL",
        status: "HEALTHY (0.8ms)",
      },
      auth: {
        layer: "SECURITY // 02",
        title: "Zero-Trust JWT & OAuth2 Service",
        protocol: "gRPC / mTLS",
        status: "SECURED",
      },
      core: {
        layer: "COMPUTE LAYER // 03",
        title: "Python FastAPI & Node Microservices",
        protocol: "AsyncIO / REST / WS",
        status: "AUTO-SCALING (8 PODS)",
      },
      cache: {
        layer: "IN-MEMORY // 04",
        title: "Distributed Redis Cache Cluster",
        protocol: "RESP Protocol",
        status: "HIT RATE: 98.4%",
      },
      db: {
        layer: "PERSISTENCE // 05",
        title: "MongoDB Sharded & PostgreSQL",
        protocol: "TCP / ACID Compliant",
        status: "SYNCHRONIZED",
      },
      ai: {
        layer: "AI / RAG ENGINE // 06",
        title: "Pinecone Vector DB & RAG Pipeline",
        protocol: "gRPC / High-Dim Embeddings",
        status: "INDEXED",
      },
    },
  },

  // ── LiveTelemetryMatrix (currently not mounted, kept in sync anyway) ──────
  telemetry: {
    eyebrow: "// 05. PRODUCTION TELEMETRY",
    heading: "VERIFIED PERFORMANCE BENCHMARKS.",
    streamingLabel: "STREAMING LIVE TELEMETRY FROM PROD // US-EAST",

    metrics: {
      uptime: {
        label: "GLOBAL CLUSTER UPTIME",
        badge: "HIGH AVAILABILITY",
        subtext: "Zero unplanned outages over 24 months of production deployments.",
      },
      latency: {
        label: "API GATEWAY LATENCY",
        badge: "ULTRA-LOW LATENCY",
        subtext: "Average response time across US-East and South American edge regions.",
      },
      concurrency: {
        label: "THROUGHPUT CAPACITY",
        badge: "CONCURRENCY",
        subtext: "Simultaneous WebSocket connections handled per containerized instance.",
      },
      security: {
        label: "VULNERABILITY MITIGATION",
        badge: "OSI HARDENED",
        subtext: "Automated CI/CD security audits and zero-trust protocol enforcement.",
      },
    },
  },

  // ── ProjectDetail ─────────────────────────────────────────────────────────
  projectDetail: {
    backToMatrix: "BACK",
    returnToMatrix: "< RETURN",
    live: "LIVE",
    building: "BUILDING",
    deployStatusLabel: "DEPLOY STATUS:",
    latencyLabel: "LATENCY:",
    architectureLabel: "ARCHITECTURE:",
    challengeHeading: "// THE CHALLENGE",
    scopeHeading: "// SCOPE & SOLUTION",
    featuresHeading: "// ARCHITECTURE & FEATURES",
    initializeLive: "INITIALIZE LIVE SYSTEM",

    terminal: {
      fileName: (id: string) => `deploy.sh — ${id}`,
      deployCommand: (target: string) => `$ deploy --target=${target}`,
      provisioning: (architecture: string) => `Provisioning ${architecture} services...`,
      stack: (stack: string) => `Stack: ${stack}`,
      healthCheck: "Health check... ",
      latencyProbe: "Latency probe: ",
      stable: "Deployment stable",
      stagingReady: "Staging build ready",
    },
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    badges: {
      cluster: "SYS_ARCH // CLUSTER 100/100",
      diagnostic: "CAD DIAGNOSTIC: READY FOR SCAN",
      protocol: "ZERO-REGRESSION PROTOCOL",
    },
    watermarkLegend: "// ARCHITECTED WITHOUT COMPROMISE //",
    watermarkHint: "[HOVER TO EXECUTE BLUEPRINT SCAN]",

    ticker: {
      operational: "ALL CLUSTERS OPERATIONAL // GLOBAL EDGE",
      latencyLabel: "LATENCY:",
      uptimeLabel: "UPTIME:",
      locationLabel: "LOCATION:",
      locationValue: "SALTA, AR // UTC-3",
      buildLabel: "BUILD:",
    },

    brandName: "IVO ZANACCHI",
    philosophy:
      "Engineering high-concurrency backend microservices, resilient cloud infrastructure, and ultra-fluid web applications. Built for zero-regression and maximum scalability.",
    availability: "READY FOR HIGH-TICKET ENGINEERING COLLABORATION.",

    modulesHeading: "// SYSTEM MODULES",
    modules: {
      stack: "01. ARCHITECTURE STACK",
      systems: "02. FLAGSHIP SYSTEMS",
      pipeline: "03. EXECUTION PIPELINE",
      topology: "04. SYSTEM TOPOLOGY",
      telemetry: "05. LIVE TELEMETRY",
      terminal: "06. CLI TERMINAL HUB",
    },

    channelsHeading: "// TRANSMISSION CHANNELS",
    channels: {
      github: "GITHUB PROTOCOL",
      linkedin: "LINKEDIN NETWORK",
      email: "DIRECT ENCRYPTION (EMAIL)",
      emailAction: "→ INITIATE",
      whatsapp: "SECURE CHANNEL (WHATSAPP)",
      whatsappAction: "→ INITIATE",
    },

    copyright: (year: number) => `© ${year} IVO ZANACCHI. ALL RIGHTS RESERVED.`,
    builtWith: "ENGINEERED WITH NEXT.JS 16 // FRAMER MOTION // TAILWIND CSS",
  },
};

/** Structural contract every locale file must satisfy. */
export type Dictionary = typeof en;
