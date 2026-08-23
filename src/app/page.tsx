import React from "react";
import { HeroPaths } from "@/components/sections/HeroPaths";
import { TechStackBento } from "@/components/sections/TechStackBento";
import { FeaturedSystems } from "@/components/sections/FeaturedSystems";
import { EngineeringPipeline } from "@/components/sections/EngineeringPipeline";
import { ArchitectureTopology } from "@/components/sections/ArchitectureTopology";

export default function Home() {
  return (
    <main className="w-full relative bg-neutral-950 overflow-visible selection:bg-cyan-500/20 selection:text-cyan-400">
      <HeroPaths/>
      <div id="stack" className="scroll-mt-28"><TechStackBento/></div>
      <div id="systems" className="scroll-mt-28"><FeaturedSystems/></div>
      <div id="pipeline" className="scroll-mt-28"><EngineeringPipeline/></div>
      <div id="topology" className="scroll-mt-28"><ArchitectureTopology/></div>
    </main>
  );
}
