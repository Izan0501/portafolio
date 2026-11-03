import { describe, expect, it } from "vitest";
import { PROJECTS } from "./projects";

/**
 * Plan M1 quality gate: "test de que cada proyecto tiene 3 capturas de
 * showcase con hotspots dentro de [0,1]; ninguna cifra sin fuente."
 */
describe("content/projects", () => {
  it("has exactly 5 real projects", () => {
    expect(PROJECTS).toHaveLength(5);
  });

  it.each(PROJECTS.map((p) => [p.id, p] as const))("%s has exactly 3 showcase shots", (_id, project) => {
    expect(project.showcase).toHaveLength(3);
  });

  it.each(PROJECTS.map((p) => [p.id, p] as const))("%s every showcase shot points at a real gallery image", (_id, project) => {
    const gallerySrcs = new Set(project.gallery.map((image) => image.src));
    for (const shot of project.showcase) {
      expect(gallerySrcs.has(shot.src)).toBe(true);
    }
  });

  it.each(PROJECTS.map((p) => [p.id, p] as const))("%s every hotspot is within [0,1]", (_id, project) => {
    for (const shot of project.showcase) {
      for (const hotspot of shot.hotspots) {
        expect(hotspot.u).toBeGreaterThanOrEqual(0);
        expect(hotspot.u).toBeLessThanOrEqual(1);
        expect(hotspot.v).toBeGreaterThanOrEqual(0);
        expect(hotspot.v).toBeLessThanOrEqual(1);
      }
    }
  });

  it.each(PROJECTS.map((p) => [p.id, p] as const))("%s has both locales for every localized field", (_id, project) => {
    for (const shot of project.showcase) {
      expect(shot.islandLabel).toHaveProperty("es");
      expect(shot.islandLabel).toHaveProperty("en");
      expect(shot.islandSub).toHaveProperty("es");
      expect(shot.islandSub).toHaveProperty("en");
      for (const hotspot of shot.hotspots) {
        expect(hotspot.label).toHaveProperty("es");
        expect(hotspot.label).toHaveProperty("en");
        expect(hotspot.sub).toHaveProperty("es");
        expect(hotspot.sub).toHaveProperty("en");
      }
    }
    expect(project.solution).toHaveProperty("es");
    expect(project.solution).toHaveProperty("en");
  });

  it("carries no latency field — plan finding A2, no fabricated metric", () => {
    for (const project of PROJECTS) {
      expect(project).not.toHaveProperty("latency");
    }
  });
});
