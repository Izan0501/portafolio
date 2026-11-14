import { describe, expect, it } from "vitest";
import { securityHeaders } from "./headers";

function findHeader(headers: { key: string; value: string }[], key: string): string | undefined {
  return headers.find((h) => h.key === key)?.value;
}

describe("securityHeaders", () => {
  it("includes HSTS only in production — asserting it over plain HTTP in dev would lock localhost out of downgrading back to HTTP", () => {
    expect(findHeader(securityHeaders(true), "Strict-Transport-Security")).toBeUndefined();
    expect(findHeader(securityHeaders(false), "Strict-Transport-Security")).toBe("max-age=63072000; includeSubDomains");
  });

  it("sets the fixed headers from the plan's table regardless of environment", () => {
    for (const isDevelopment of [true, false]) {
      const headers = securityHeaders(isDevelopment);
      expect(findHeader(headers, "X-Content-Type-Options")).toBe("nosniff");
      expect(findHeader(headers, "X-Frame-Options")).toBe("DENY");
      expect(findHeader(headers, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
      expect(findHeader(headers, "Cross-Origin-Opener-Policy")).toBe("same-origin");
    }
  });

  it("denies camera/microphone/geolocation/payment/usb and opts out of FLoC-style cohort tracking", () => {
    const permissionsPolicy = findHeader(securityHeaders(false), "Permissions-Policy");
    expect(permissionsPolicy).toContain("camera=()");
    expect(permissionsPolicy).toContain("microphone=()");
    expect(permissionsPolicy).toContain("geolocation=()");
    expect(permissionsPolicy).toContain("payment=()");
    expect(permissionsPolicy).toContain("usb=()");
    expect(permissionsPolicy).toContain("interest-cohort=()");
  });

  it("defaults to Report-Only — the safer mode if CSP_ENFORCE is simply unset on a fresh deploy", () => {
    delete process.env.CSP_ENFORCE;
    const headers = securityHeaders(false);
    expect(findHeader(headers, "Content-Security-Policy-Report-Only")).toContain("default-src 'self'");
    expect(findHeader(headers, "Content-Security-Policy")).toBeUndefined();
  });

  it("switches to the real, blocking header only once CSP_ENFORCE=true", () => {
    process.env.CSP_ENFORCE = "true";
    try {
      const headers = securityHeaders(false);
      expect(findHeader(headers, "Content-Security-Policy")).toContain("default-src 'self'");
      expect(findHeader(headers, "Content-Security-Policy-Report-Only")).toBeUndefined();
    } finally {
      delete process.env.CSP_ENFORCE;
    }
  });
});
