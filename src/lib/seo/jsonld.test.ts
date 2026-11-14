import { describe, expect, it } from "vitest";
import { buildPersonJsonLd, buildProfilePageJsonLd, buildProjectJsonLd, buildWebSiteJsonLd } from "./jsonld";
import { PROJECTS } from "@/content/projects";

describe("buildPersonJsonLd", () => {
  const person = buildPersonJsonLd();

  it("never includes SoftwareSourceCode-shaped data — no repo URLs are invented", () => {
    expect(JSON.stringify(person)).not.toContain("SoftwareSourceCode");
  });

  it("includes both real education entries as alumniOf", () => {
    expect(person.alumniOf).toHaveLength(2);
  });

  it("includes all 5 real credentials", () => {
    expect(person.hasCredential).toHaveLength(5);
  });

  it("omits dateCreated for the one credential with no real date (fullstack/DevSchool)", () => {
    const credentials = JSON.parse(JSON.stringify(person.hasCredential)) as { name?: string; dateCreated?: string }[];
    const fullstack = credentials.find((c) => c.name === "Full Stack Web Developer");
    expect(fullstack?.dateCreated).toBeUndefined();
  });

  it("uses the real Tucumán/AR address, not an invented one", () => {
    expect(JSON.stringify(person.address)).toContain("Tucumán");
    expect(JSON.stringify(person.address)).toContain("AR");
  });
});

describe("buildProfilePageJsonLd", () => {
  it("nests a real Person as mainEntity", () => {
    const profilePage = buildProfilePageJsonLd();
    expect(profilePage.mainEntity).toMatchObject({ "@type": "Person" });
  });
});

describe("buildWebSiteJsonLd", () => {
  it("has a real @type and name", () => {
    const site = buildWebSiteJsonLd();
    expect(site["@type"]).toBe("WebSite");
    expect(site.name).toBeTruthy();
  });
});

describe("buildProjectJsonLd", () => {
  it("builds a CreativeWork for every real project", () => {
    for (const project of PROJECTS) {
      const jsonLd = buildProjectJsonLd(project, "es");
      expect(jsonLd["@type"]).toBe("CreativeWork");
      expect(jsonLd.name).toBe(project.title);
      expect(jsonLd.keywords).toBe(project.stack.join(", "));
    }
  });

  it("only includes url for a project with a real liveUrl (Estudio Zanacchi)", () => {
    const estudio = PROJECTS.find((p) => p.id === "estudio-zanacchi");
    expect(estudio?.liveUrl).toBeTruthy();
    const jsonLd = buildProjectJsonLd(estudio!, "es");
    expect(jsonLd.url).toBe(estudio!.liveUrl);
  });

  it("omits url for a project with no real liveUrl", () => {
    const withoutLiveUrl = PROJECTS.find((p) => !p.liveUrl);
    expect(withoutLiveUrl).toBeTruthy();
    const jsonLd = buildProjectJsonLd(withoutLiveUrl!, "es");
    expect(jsonLd.url).toBeUndefined();
  });
});
