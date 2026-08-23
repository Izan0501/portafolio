import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS_DATA, getProjectById } from "@/data/projects";
import { ProjectDetail } from "@/components/sections/ProjectDetail";

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

  return {
    title: `${project.title} | Ivo Zanacchi`,
    description: project.scope,
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
