import { ExperienceShell } from "@/views/home/ExperienceShell";

/**
 * Server Component (plan §2.1): renders `<ExperienceShell/>`, whose own
 * chapter components (`NarrativeChapter`/`Profile`/`Formation`/etc., all
 * "use client") still SSR their real copy as semantic HTML on the first
 * response — "use client" only changes when a component hydrates, not
 * whether the server renders its output first. FCP/LCP read that HTML
 * directly; the 3D stage inside `ExperienceShell` only mounts after,
 * `ssr:false` + `next/dynamic`.
 *
 * M16: replaces the legacy `HeroPaths`/`TechStackBento`/`FeaturedSystems`/
 * `EngineeringPipeline` sections — the plan's own target tree (§1.4) names
 * this exact shape, deferred until the module that could actually make
 * the swap without leaving `/` broken (every earlier module: "not M_'s
 * call to make unilaterally").
 */
export default function Home() {
  return <ExperienceShell />;
}
