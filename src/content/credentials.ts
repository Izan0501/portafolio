import type { Credential } from "@/types/content";

/**
 * The 5 real certifications, ported 1:1 from the approved artifact
 * (`docs/reference/artifact-a/Hero.dc.html`, `this.CERTS`, line 195). Hours,
 * weeks and dates are copied verbatim — nothing here is estimated or rounded.
 *
 * `fullstack` (DevSchool) has no hours/weeks/date in the source: its `rows`
 * are a curriculum list instead, so `curriculum` is set and
 * `hours`/`weeks`/`date`/`certifiedBy` are left undefined rather than guessed.
 *
 * `date` is an ISO string mechanically derived from `dateLabel` (same value,
 * reformatted) — never a separate fact.
 *
 * Image dimensions (`width`/`height`) are the real intrinsic pixel sizes
 * already verified in the legacy `CertificationWindows.tsx` (`CERT_META`).
 *
 * `image` still points at the original, uncensored `FullStack.png` — the DNI
 * redaction is M2's job (plan §0.1-6), not M1's. See the M1 report for the
 * reminder.
 */
export const CREDENTIALS: Credential[] = [
  {
    id: "fullstack",
    image: "/projects/certifications/FullStack.png",
    width: 2044,
    height: 1456,
    tag: "FULL-STACK",
    title: "Full Stack Web Developer",
    issuer: "DevSchool",
    curriculum: ["HTML5 · CSS3 · Bootstrap 5", "JavaScript · React.js", "Node.js · Express.js · MongoDB"],
    top10: false,
  },
  {
    id: "python",
    image: "/projects/certifications/python.jpeg",
    width: 1280,
    height: 914,
    tag: "LENGUAJE",
    title: "Python",
    issuer: "Coderhouse",
    certifiedBy: "Ualá",
    hours: 52,
    weeks: 13,
    date: "2025-12-17",
    dateLabel: "17 de diciembre de 2025",
    top10: false,
  },
  {
    id: "mobile",
    image: "/projects/certifications/AppsDev.jpeg",
    width: 1600,
    height: 1037,
    tag: "MÓVIL",
    title: "Desarrollo de Aplicaciones",
    issuer: "Coderhouse",
    certifiedBy: "PedidosYa",
    hours: 36,
    weeks: 9,
    date: "2024-05-15",
    dateLabel: "15 de mayo de 2024",
    top10: true,
  },
  {
    id: "javascript",
    image: "/projects/certifications/JS.jpeg",
    width: 1600,
    height: 1037,
    tag: "LENGUAJE",
    title: "JavaScript",
    issuer: "Coderhouse",
    certifiedBy: "PedidosYa",
    hours: 36,
    weeks: 9,
    date: "2024-01-25",
    dateLabel: "25 de enero de 2024",
    top10: false,
  },
  {
    id: "cybersecurity",
    image: "/projects/certifications/CiberSeg.jpeg",
    width: 1600,
    height: 1037,
    tag: "SEGURIDAD",
    title: "Ciberseguridad",
    issuer: "Coderhouse",
    certifiedBy: "Binance",
    hours: 30,
    weeks: 8,
    date: "2023-11-06",
    dateLabel: "6 de noviembre de 2023",
    top10: false,
  },
];

export function getCredentialById(id: Credential["id"]): Credential | undefined {
  return CREDENTIALS.find((c) => c.id === id);
}
