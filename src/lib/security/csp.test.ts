import { describe, expect, it } from "vitest";
import { buildCsp } from "./csp";

describe("buildCsp", () => {
  it("never allows unsafe-eval in production", () => {
    expect(buildCsp(false)).not.toContain("unsafe-eval");
  });

  it("allows unsafe-eval only in development, for React's own dev-server stack traces", () => {
    expect(buildCsp(true)).toContain("unsafe-eval");
  });

  it("blocks plugins/object embeds outright", () => {
    expect(buildCsp(false)).toContain("object-src 'none'");
  });

  it("allows self/data/blob for images — covers WebGL texture blobs and next/image, nothing remote", () => {
    const csp = buildCsp(false);
    expect(csp).toContain("img-src 'self' data: blob:");
    expect(csp).not.toContain("images.unsplash.com");
  });

  it("allows blob workers — covers three.js's own worker usage", () => {
    expect(buildCsp(false)).toContain("worker-src 'self' blob:");
  });

  it("forbids being framed by another origin", () => {
    expect(buildCsp(false)).toContain("frame-ancestors 'none'");
  });

  it("allows the mailto: form action Contacto's email CTA relies on", () => {
    expect(buildCsp(false)).toContain("form-action 'self' mailto:");
  });
});
