import React from "react";
import { HeroPaths } from "@/components/sections/HeroPaths";
import { TechStackBento } from "@/components/sections/TechStackBento";
import { FeaturedSystems } from "@/components/sections/FeaturedSystems";
import { EngineeringPipeline } from "@/components/sections/EngineeringPipeline";

export default function Home() {
  // No <main> here — layout.tsx already renders the one landmark per page
  // (plan finding A1: this file used to nest a second <main> inside it).
  return (
    <div className="w-full relative bg-grafito overflow-visible selection:bg-limon/20 selection:text-limon">
      <HeroPaths/>
      <div id="stack" className="scroll-mt-28"><TechStackBento/></div>
      <div id="systems" className="scroll-mt-28"><FeaturedSystems/></div>
      <div id="pipeline" className="scroll-mt-28"><EngineeringPipeline/></div>
    </div>
  );
}
