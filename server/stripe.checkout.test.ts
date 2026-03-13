import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Unit tests for the Stripe checkout session creation logic.
 * We mock the Stripe SDK so no real API calls are made.
 */

// Mock Stripe before importing the router
vi.mock("stripe", () => {
  const mockCreate = vi.fn().mockResolvedValue({
    id: "cs_test_mock123",
    url: "https://checkout.stripe.com/pay/cs_test_mock123",
  });

  const MockStripe = vi.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockCreate,
      },
    },
  }));

  return { default: MockStripe };
});

// Set required env vars before importing router
process.env.STRIPE_SECRET_KEY = "sk_test_mock";

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { origin: "https://app.autorephero.com" },
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("stripe.createCheckoutSession", () => {
  it("returns a checkout URL for boots_on_the_ground subscription", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.stripe.createCheckoutSession({
      productId: "boots_on_the_ground",
      origin: "https://app.autorephero.com",
      customerEmail: "test@example.com",
      customerName: "Test User",
    });

    expect(result).toHaveProperty("url");
    expect(result.url).toContain("checkout.stripe.com");
  });

  it("returns a checkout URL for nfc_starter_pack one-time payment", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.stripe.createCheckoutSession({
      productId: "nfc_starter_pack",
      origin: "https://app.autorephero.com",
    });

    expect(result).toHaveProperty("url");
    expect(result.url).toBeTruthy();
  });

  it("returns a checkout URL for asset_starter_pack one-time payment", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.stripe.createCheckoutSession({
      productId: "asset_starter_pack",
      origin: "https://app.autorephero.com",
    });

    expect(result).toHaveProperty("url");
    expect(result.url).toBeTruthy();
  });

  it("rejects invalid product IDs", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.stripe.createCheckoutSession({
        productId: "invalid_product" as "boots_on_the_ground",
        origin: "https://app.autorephero.com",
      })
    ).rejects.toThrow();
  });
});
