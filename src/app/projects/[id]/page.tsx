import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS_DATA, getProjectById } from "@/data/projects";
import { ProjectDetail } from "@/components/sections/ProjectDetail";
import { DEFAULT_LOCALE } from "@/i18n/config";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return PROJECTS_DATA.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    return {};
  }

  // Metadata is emitted at build time, before any client locale exists, so it is
  // always the default locale. That is the accepted cost of keeping one URL per
  // project instead of locale-prefixed routes.
  return {
    title: `${project.title} | Ivo Zanacchi`,
    description: project.scope[DEFAULT_LOCALE],
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectDetail id={id} />;
}
