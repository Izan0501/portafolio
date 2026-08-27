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
      "A passionate Full-Stack Developer and DevOps Architect based in Tucumán, Argentina — focused on building resilient systems that hold up under real-world load.",
    ctaResume: "DOWNLOAD CV",
    ctaInspect: "INSPECT ARCHITECTURE",
  },

  // ── TechStackBento (identity, academics, agile, terminal, toolchain) ────────
  stack: {
    eyebrow: "// 01. ENGINEER IDENTITY & TOOLCHAIN",
    heading: "Architecture & Execution",
    subheading:
      "A relentless focus on resilient systems, continuous integration, and deep collaboration within industry-standard Agile frameworks.",

    architect: {
      eyebrow: "// 00. THE ARCHITECT",
      title: "Full-Stack Developer & DevOps Architect",
      location: "Tucumán, Argentina",
      bio: "I'm Ivo Zanacchi. I build systems the way I'd want to inherit them: clean, documented, and boring in the best way — infrastructure that scales without duct tape, and code reviews that don't need a translator. My focus is zero-regression delivery: every deploy should be routine, every rollback should be unnecessary, and every service should still make sense to read six months from now.",
      pillars: ["CLEAN CODE", "SCALABLE ARCHITECTURE", "ZERO-REGRESSION"],
    },

    academic: {
      title: "Academic Core",
      inProgress: "In Progress",
      degrees: {
        cybersecurity: {
          name: "University Technical Degree in Cybersecurity",
          institution: "// UGR",
        },
        programming: {
          name: "University Technician in Programming",
          institution: "// UTN — Tucumán Regional Faculty",
        },
      },
    },

    agile: {
      fileName: "agile_readiness.sh",
      title: "Agile & Scrum Readiness",
      bodyBefore: "I've built a deep, deliberate foundation in ",
      bodyStrong: "SCRUM and Agile frameworks",
      bodyAfter:
        " — not just the ceremonies, but the discipline behind them. I'm ready to drop into a fast-paced team's existing workflow from day one: clear communication, rapid unblocking, and sprint commitments that get kept.",
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
      placeholder: "Type a command...",
      run: "RUN ↵",
      initCommand: "init --system",
      initOutput: "System initialized. Type 'help' or click a command chip below.",
      help: "Available commands: [stack] [experience] [contact] [github] [resume] [clear] [hire]",
      techStack:
        "Backend: Python (FastAPI), Node.js, TypeScript. DevOps: Docker, Kubernetes, CI/CD, AWS. DBs: MongoDB, PostgreSQL, Pinecone RAG.",
      experience:
        "Full-Stack Software Engineer & DevOps specializing in zero-downtime architectures, multi-tenant SaaS platforms, and network protocol audits.",
      emailLabel: "Email:",
      linkedinLabel: "LinkedIn:",
      githubLabel: "Source archive:",
      resume: "Resume artifact not uploaded to this build yet — use 'contact' to request one directly.",
      hire: (email: string) =>
        `ACCESS GRANTED. High-priority recruitment routing activated — send a transmission to ${email} to initiate contract discussions.`,
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
    heading: "Production Architecture",
    inspectMatrix: "INSPECT DEPLOYMENT MATRIX",

    core: {
      eyebrow: "// CENTRAL CLUSTER CORE",
      title: "Zero-Regression",
      description:
        "High-concurrency backend microservices, containerized orchestration, and sub-millisecond edge routing.",
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
      eyebrow: "// AUDIT LOG: PRODUCTION SYSTEMS STATUS",
      heading: "Deployment Matrix",
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
    heading: "THE ENGINEERING LIFECYCLE.",
    subheading:
      "From access-layer architecture and container isolation to CI-driven builds and manually verified deployments — the real workflow behind every shipped system.",
    phaseLabel: (phase: string, badge: string) => `PHASE // ${phase} — ${badge}`,
    executionProtocol: "[EXECUTION PROTOCOL]",

    stages: {
      security: {
        badge: "PROTOCOL // ACCESS & AUTH DESIGN",
        title: "Access-Layer Architecture & Security Review",
        desc: "Designing session and permission boundaries before implementation — JWT/OAuth2 token flows with access & refresh rotation, and a manual review pass on every auth-adjacent endpoint.",
      },
      docker: {
        badge: "INFRASTRUCTURE // ISOLATION",
        title: "Containerization & Reproducible Environments",
        desc: "Multi-stage Docker builds with Swarm-based scaling for backend services (VeeBot), and Turbopack-optimized production builds for frontend platforms (Axon Crafts).",
      },
      cicd: {
        badge: "AUTOMATION // CI PIPELINES",
        title: "CI Automation & Manual QA Gate",
        desc: "GitHub Actions runs build, type-check, and lint on every push. A manual QA pass is still the gate before merging to main — automated test coverage is on the roadmap, not a claim we make yet.",
      },
      edge: {
        badge: "RELEASE // DEPLOYMENT",
        title: "Zero-Downtime Release & Manual Verification",
        desc: "Rolling Swarm deploys on AWS for backend services, instant edge deploys via Vercel + Cloudflare for frontend platforms — verified manually post-release while dedicated observability tooling is still on the roadmap.",
      },
    },

    artifacts: {
      security: {
        jwt: "JWT / OAuth2 — Access & Refresh Rotation",
        review: "Manual Code Review — Auth & Session Paths",
      },
      docker: {
        buildComment: "// Multi-stage production container build",
        swarmComment: "// Swarm scaling (VeeBot)",
      },
      cicd: {
        build: "Actions — Build",
        typescript: "TypeScript Strict",
        manualQa: "Manual QA — Pre-Merge",
        pass: "✓ PASS",
        checked: "✓ CHECKED",
      },
      edge: {
        targets: "AWS Docker Swarm // Vercel Edge + Cloudflare",
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
    backToMatrix: "BACK TO MATRIX",
    returnToMatrix: "< RETURN TO MATRIX",
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
    },

    copyright: (year: number) => `© ${year} IVO ZANACCHI. ALL RIGHTS RESERVED.`,
    builtWith: "ENGINEERED WITH NEXT.JS 16 // FRAMER MOTION // TAILWIND CSS",
  },
};

/** Structural contract every locale file must satisfy. */
export type Dictionary = typeof en;
