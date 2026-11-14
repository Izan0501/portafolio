import type { CreativeWorkLeaf, EducationalOccupationalCredential, EducationalOrganizationLeaf, PersonLeaf, ProfilePage, WebSite, WithContext } from "schema-dts";
import { SITE, SITE_URL } from "@/config/site";
import { PROFILE } from "@/content/profile";
import { CREDENTIALS } from "@/content/credentials";
import type { ProjectContent } from "@/types/content";
import type { Locale } from "@/i18n/config";

/**
 * JSON-LD builders (plan §5.2) — typed with `schema-dts` (already a real
 * dependency, confirmed in `package.json`), each returning a
 * `WithContext<T>` ready to `JSON.stringify` straight into a
 * `<script type="application/ld+json">`. Inserted inline, no `nonce`
 * prop needed: M14's CSP already allows `script-src 'unsafe-inline'`
 * (the decision that kept `/` and `/projects/[id]` static), the same
 * reason `layout.tsx`'s `scrollRestoration` script needed none either.
 *
 * `SoftwareSourceCode` is intentionally not built here — the plan is
 * explicit that none of the 5 projects have a public repository URL
 * today and none are invented; Ivo confirmed omitting it rather than
 * supplying links (M15).
 */

function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

const EDUCATIONAL_ORGANIZATIONS: EducationalOrganizationLeaf[] = PROFILE.education.map((entry) => ({
  "@type": "EducationalOrganization",
  name: entry.institution.es,
}));

const CREDENTIAL_SCHEMAS: EducationalOccupationalCredential[] = CREDENTIALS.map((credential) => ({
  "@type": "EducationalOccupationalCredential",
  name: credential.title,
  credentialCategory: "certificate",
  recognizedBy: { "@type": "Organization", name: credential.issuer },
  // `fullstack` (DevSchool) has no real date in `content/credentials.ts`
  // (a curriculum list instead, per that file's own comment) — omitted
  // here rather than guessed, same "nothing estimated or rounded" rule
  // that file already follows.
  ...(credential.date ? { dateCreated: credential.date } : {}),
}));

export function buildPersonJsonLd(): WithContext<PersonLeaf> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    jobTitle: SITE.role,
    url: SITE_URL,
    image: absoluteUrl("/media/profile/ivodev-640.webp"),
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Tucumán",
      addressCountry: "AR",
    },
    sameAs: [...SITE.sameAs],
    alumniOf: EDUCATIONAL_ORGANIZATIONS,
    hasCredential: CREDENTIAL_SCHEMAS,
    // Plan §5.2's own literal list — not derived from `content/`, since
    // no single field there already enumerates "topics this person
    // knows about" the way this schema property asks for.
    knowsAbout: ["React", "Next.js", "TypeScript", "FastAPI", "Node.js", "PostgreSQL", "Docker", "CI/CD", "seguridad web"],
  };
}

export function buildProfilePageJsonLd(): WithContext<ProfilePage> {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    // `inLanguage` belongs here, not on `Person` — schema-dts (following
    // the real schema.org definitions) rejects it on `Person`; this page
    // being in Spanish is a property of the page, not of the person.
    inLanguage: "es",
    mainEntity: buildPersonJsonLd(),
  };
}

export function buildWebSiteJsonLd(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE_URL,
    inLanguage: ["es", "en"],
  };
}

const STATUS_LABEL: Record<ProjectContent["status"], string> = {
  PROD: "Production",
  DEV: "Development",
};

export function buildProjectJsonLd(project: ProjectContent, locale: Locale): WithContext<CreativeWorkLeaf> {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.scope[locale],
    image: absoluteUrl(project.heroImage),
    creator: { "@type": "Person", name: SITE.name, url: SITE_URL },
    keywords: project.stack.join(", "),
    creativeWorkStatus: STATUS_LABEL[project.status],
    ...(project.liveUrl ? { url: project.liveUrl } : {}),
  };
}
