import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS, getProjectContent } from "@/content/projects";
import { ProjectView } from "@/views/project/ProjectView";
import { DEFAULT_LOCALE } from "@/i18n/config";
import { baseOpenGraph, baseTwitter } from "@/lib/seo/metadata";
import { buildProjectJsonLd } from "@/lib/seo/jsonld";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectContent(id);

  if (!project) {
    return {};
  }

  // Metadata is emitted at build time, before any client locale exists, so it is
  // always the default locale. That is the accepted cost of keeping one URL per
  // project instead of locale-prefixed routes.
  const title = project.title;
  const description = project.scope[DEFAULT_LOCALE];
  const url = `/projects/${project.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { ...baseOpenGraph, type: "website", url, title, description },
    twitter: { ...baseTwitter, title, description },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = getProjectContent(id);

  if (!project) {
    notFound();
  }

  return (
    <>
      {/* JSON-LD (plan §5.2): a CreativeWork per project — no nonce, same
          reason as layout.tsx's own scripts (M14's CSP allows 'unsafe-inline'). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProjectJsonLd(project, DEFAULT_LOCALE)) }} />
      <ProjectView project={project} />
    </>
  );
}
