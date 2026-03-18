import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../trpc";
import {
  getBusinessBySlug, getBusinessById, getBusinessesByOwner, getAllBusinesses,
  createBusiness, updateBusiness,
  getPlatformsByBusiness, updatePlatform,
  getStaffByBusiness, createStaff, updateStaff,
  getLeadsByBusiness, getAllLeads, createLead,
  isTrialExpired,
} from "../db";
import { env } from "../env";

// ─── Slug generator ───────────────────────────────────────────
function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

export const businessRouter = router({
  // ─── Public: get business config for review hub ─────────────
  getPublic: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const biz = await getBusinessBySlug(input.slug);
      if (!biz) throw new Error("Business not found");
      const platforms = await getPlatformsByBusiness(biz.id);
      const staff = await getStaffByBusiness(biz.id);
      const trialExpired = isTrialExpired(biz);
      return {
        id: biz.id,
        name: biz.name,
        slug: biz.slug,
        businessType: biz.businessType,
        tagline: biz.tagline,
        keywords: JSON.parse(biz.keywords || "[]") as string[],
        ownerPin: biz.ownerPin,
        planTier: biz.planTier,
        trialExpired,
        platforms,
        staff,
      };
    }),

  // ─── Owner: list my businesses ───────────────────────────────
  myBusinesses: protectedProcedure.query(async ({ ctx }) => {
    const businesses = await getBusinessesByOwner(ctx.user.id);
    return businesses.map(b => ({
      ...b,
      keywords: JSON.parse(b.keywords || "[]") as string[],
      trialExpired: isTrialExpired(b),
    }));
  }),

  // ─── Owner: create business ──────────────────────────────────
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(2),
      businessType: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      ownerPin: z.string().length(4).optional(),
      tagline: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      let slug = generateSlug(input.name);
      // Ensure slug uniqueness
      const existing = await getBusinessBySlug(slug);
      if (existing) slug = `${slug}-${Date.now().toString(36)}`;

      const biz = await createBusiness({
        ownerId: ctx.user.id,
        name: input.name,
        slug,
        businessType: input.businessType,
        phone: input.phone,
        email: input.email,
        ownerPin: input.ownerPin || "1234",
        tagline: input.tagline,
        keywords: input.keywords,
        planTier: "trial",
      });
      return biz;
    }),

  // ─── Owner: update business settings ────────────────────────
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(2).optional(),
      businessType: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      ownerPin: z.string().length(4).optional(),
      tagline: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const biz = await getBusinessById(input.id);
      if (!biz) throw new Error("Business not found");
      if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
      const { id, ...data } = input;
      return updateBusiness(id, data);
    }),

  // ─── Owner: get platforms ────────────────────────────────────
  getPlatforms: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input, ctx }) => {
      const biz = await getBusinessById(input.businessId);
      if (!biz) throw new Error("Business not found");
      if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
      return getPlatformsByBusiness(input.businessId);
    }),

  // ─── Owner: update platform ──────────────────────────────────
  updatePlatform: protectedProcedure
    .input(z.object({
      id: z.number(),
      businessId: z.number(),
      url: z.string().optional(),
      reviewCount: z.number().optional(),
      targetCount: z.number().optional(),
      enabled: z.boolean().optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const biz = await getBusinessById(input.businessId);
      if (!biz) throw new Error("Business not found");
      if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
      const { id, businessId, ...data } = input;
      await updatePlatform(id, data);
      return { success: true };
    }),

  // ─── Owner: staff management ─────────────────────────────────
  getStaff: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input, ctx }) => {
      const biz = await getBusinessById(input.businessId);
      if (!biz) throw new Error("Business not found");
      if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
      return getStaffByBusiness(input.businessId);
    }),

  addStaff: protectedProcedure
    .input(z.object({ businessId: z.number(), name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const biz = await getBusinessById(input.businessId);
      if (!biz) throw new Error("Business not found");
      if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
      return createStaff(input.businessId, input.name);
    }),

  updateStaff: protectedProcedure
    .input(z.object({ id: z.number(), businessId: z.number(), shares: z.number().optional(), reviews: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const biz = await getBusinessById(input.businessId);
      if (!biz) throw new Error("Business not found");
      if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
      await updateStaff(input.id, { shares: input.shares, reviews: input.reviews });
      return { success: true };
    }),

  // ─── Owner: leads ────────────────────────────────────────────
  getLeads: protectedProcedure
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input, ctx }) => {
      const biz = await getBusinessById(input.businessId);
      if (!biz) throw new Error("Business not found");
      if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
      return getLeadsByBusiness(input.businessId);
    }),

  // ─── Public: submit lead ─────────────────────────────────────
  submitLead: publicProcedure
    .input(z.object({
      businessId: z.number().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      businessName: z.string().optional(),
      website: z.string().optional(),
      source: z.string().optional(),
      smsConsent: z.boolean().optional(),
      marketingConsent: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      await createLead(input);
      return { success: true };
    }),

  // ─── Admin: all businesses ───────────────────────────────────
  adminGetAll: adminProcedure.query(async () => {
    const businesses = await getAllBusinesses();
    return businesses.map(b => ({
      ...b,
      keywords: JSON.parse(b.keywords || "[]") as string[],
      trialExpired: isTrialExpired(b),
    }));
  }),

  // ─── Admin: set plan tier ────────────────────────────────────
  adminSetPlan: adminProcedure
    .input(z.object({
      businessId: z.number(),
      planTier: z.enum(["trial", "kit", "core", "pro"]),
    }))
    .mutation(async ({ input }) => {
      await updateBusiness(input.businessId, { planTier: input.planTier });
      return { success: true };
    }),

  // ─── Admin: create business for a client ────────────────────
  adminCreate: adminProcedure
    .input(z.object({
      ownerId: z.number(),
      name: z.string().min(2),
      businessType: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      ownerPin: z.string().length(4).optional(),
      planTier: z.enum(["trial", "kit", "core", "pro"]).optional(),
    }))
    .mutation(async ({ input }) => {
      let slug = generateSlug(input.name);
      const existing = await getBusinessBySlug(slug);
      if (existing) slug = `${slug}-${Date.now().toString(36)}`;
      return createBusiness({ ...input, slug });
    }),

  // ─── Admin: all leads ────────────────────────────────────────
  adminGetLeads: adminProcedure.query(async () => {
    return getAllLeads();
  }),

  // ─── Stripe links ────────────────────────────────────────────
  getStripeLinks: publicProcedure.query(() => ({
    kitLink: env.STRIPE_KIT_LINK,
    coreLink: env.STRIPE_CORE_LINK,
  })),
});
