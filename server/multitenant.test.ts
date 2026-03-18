/* ============================================================
   AutoRepHero Multi-Tenant System — Unit Tests
   Tests: auth helpers, trial expiry logic, slug generation,
          plan tier gating
   ============================================================ */
import { describe, it, expect, vi } from "vitest";

// ─── Auth helpers ─────────────────────────────────────────────
describe("signToken / verifyToken", () => {
  it("should sign and verify a valid JWT payload", async () => {
    // Mock env before importing auth
    vi.stubEnv("JWT_SECRET", "test-secret-at-least-32-chars-long-ok");

    const { signToken, verifyToken } = await import("./auth");
    const token = await signToken({ userId: 1, email: "test@example.com", role: "user" });
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3); // valid JWT structure

    const payload = await verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(1);
    expect(payload?.email).toBe("test@example.com");
    expect(payload?.role).toBe("user");
  });

  it("should return null for an invalid token", async () => {
    const { verifyToken } = await import("./auth");
    const payload = await verifyToken("not.a.valid.token");
    expect(payload).toBeNull();
  });
});

// ─── Trial expiry logic (inline — avoids DB connection in tests) ─
function isTrialExpired(business: { planTier: string; trialStartedAt: Date }): boolean {
  if (business.planTier !== "trial") return false;
  const days = (Date.now() - new Date(business.trialStartedAt).getTime()) / (1000 * 60 * 60 * 24);
  return days > 14;
}

describe("isTrialExpired", () => {
  it("should return false for non-trial plans", () => {
    const biz = { planTier: "core", trialStartedAt: new Date(Date.now() - 30 * 86400000) };
    expect(isTrialExpired(biz)).toBe(false);
  });

  it("should return false for a trial started today", () => {
    const biz = { planTier: "trial", trialStartedAt: new Date() };
    expect(isTrialExpired(biz)).toBe(false);
  });

  it("should return true for a trial started 15 days ago", () => {
    const biz = {
      planTier: "trial",
      trialStartedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000),
    };
    expect(isTrialExpired(biz)).toBe(true);
  });

  it("should return false for a trial started 13 days ago", () => {
    const biz = {
      planTier: "trial",
      trialStartedAt: new Date(Date.now() - 13 * 24 * 3600 * 1000),
    };
    expect(isTrialExpired(biz)).toBe(false);
  });

  it("should return false for kit plan regardless of age", () => {
    const biz = {
      planTier: "kit",
      trialStartedAt: new Date(Date.now() - 100 * 24 * 3600 * 1000),
    };
    expect(isTrialExpired(biz)).toBe(false);
  });
});

// ─── Slug generation ──────────────────────────────────────────
describe("slug generation", () => {
  function generateSlug(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);
  }

  it("should lowercase and hyphenate spaces", () => {
    expect(generateSlug("Smith Auto Repair")).toBe("smith-auto-repair");
  });

  it("should remove special characters", () => {
    expect(generateSlug("Bob's Garage & Tires!")).toBe("bobs-garage-tires");
  });

  it("should truncate to 50 chars", () => {
    const long = "A".repeat(60);
    expect(generateSlug(long).length).toBeLessThanOrEqual(50);
  });

  it("should handle single word", () => {
    expect(generateSlug("AutoRepHero")).toBe("autorephero");
  });
});

// ─── Plan tier gating ─────────────────────────────────────────
describe("platform locking by plan tier", () => {
  const TRIAL_PLATFORMS = ["facebook", "yelp", "bbb"];

  function isPlatformLocked(platformId: string, planTier: string): boolean {
    if (planTier === "core" || planTier === "pro") return false;
    return !TRIAL_PLATFORMS.includes(platformId);
  }

  it("should lock google on trial", () => {
    expect(isPlatformLocked("google", "trial")).toBe(true);
  });

  it("should lock google on kit", () => {
    expect(isPlatformLocked("google", "kit")).toBe(true);
  });

  it("should unlock google on core", () => {
    expect(isPlatformLocked("google", "core")).toBe(false);
  });

  it("should unlock google on pro", () => {
    expect(isPlatformLocked("google", "pro")).toBe(false);
  });

  it("should keep facebook unlocked on trial", () => {
    expect(isPlatformLocked("facebook", "trial")).toBe(false);
  });

  it("should keep yelp unlocked on trial", () => {
    expect(isPlatformLocked("yelp", "trial")).toBe(false);
  });

  it("should keep bbb unlocked on trial", () => {
    expect(isPlatformLocked("bbb", "trial")).toBe(false);
  });

  it("should lock angi on trial", () => {
    expect(isPlatformLocked("angi", "trial")).toBe(true);
  });

  it("should unlock all platforms on core", () => {
    const allPlatforms = ["facebook", "yelp", "bbb", "google", "angi", "trustpilot", "cargurus"];
    allPlatforms.forEach(p => {
      expect(isPlatformLocked(p, "core")).toBe(false);
    });
  });
});
