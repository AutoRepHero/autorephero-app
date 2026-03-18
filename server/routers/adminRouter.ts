import { z } from "zod";
import bcrypt from "bcryptjs";
import { router, adminProcedure } from "../trpc";
import {
  getAllBusinesses, getAllLeads, updateBusiness, createBusiness,
  getBusinessBySlug, getUserByEmail, createUser, deleteBusinessById,
} from "../db";
import { isTrialExpired } from "../db";

function generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

export const adminRouter = router({
  // ─── All businesses ──────────────────────────────────────────
  getAllBusinesses: adminProcedure.query(async () => {
    const businesses = await getAllBusinesses();
    return businesses.map(b => ({
      ...b,
      keywords: JSON.parse(b.keywords || "[]") as string[],
      trialExpired: isTrialExpired(b),
    }));
  }),

  // ─── Update plan tier ────────────────────────────────────────
  updateBusinessPlan: adminProcedure
    .input(z.object({
      businessId: z.number(),
      planTier: z.enum(["trial", "kit", "core", "pro"]),
    }))
    .mutation(async ({ input }) => {
      await updateBusiness(input.businessId, { planTier: input.planTier });
      return { success: true };
    }),

  // ─── Extend trial ────────────────────────────────────────────
  extendTrial: adminProcedure
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      // Reset trialStartedAt to now so they get 14 more days
      await updateBusiness(input.businessId, { trialStartedAt: new Date() });
      return { success: true };
    }),

  // ─── Delete business ─────────────────────────────────────────
  deleteBusiness: adminProcedure
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteBusinessById(input.businessId);
      return { success: true };
    }),

  // ─── Create business + owner account ─────────────────────────
  createBusiness: adminProcedure
    .input(z.object({
      ownerName: z.string().min(2),
      ownerEmail: z.string().email(),
      ownerPassword: z.string().min(8),
      businessName: z.string().min(2),
      planTier: z.enum(["trial", "kit", "core", "pro"]).default("trial"),
    }))
    .mutation(async ({ input }) => {
      // Create or find user
      let user = await getUserByEmail(input.ownerEmail);
      if (!user) {
        const passwordHash = await bcrypt.hash(input.ownerPassword, 12);
        user = await createUser({ email: input.ownerEmail, passwordHash, name: input.ownerName });
      }
      if (!user) throw new Error("Failed to create user");

      // Create business
      let slug = generateSlug(input.businessName);
      const existing = await getBusinessBySlug(slug);
      if (existing) slug = `${slug}-${Date.now().toString(36)}`;

      const biz = await createBusiness({
        ownerId: user.id,
        name: input.businessName,
        slug,
        planTier: input.planTier,
        ownerPin: "1234",
      });
      return { user, business: biz };
    }),

  // ─── All leads ───────────────────────────────────────────────
  getAllLeads: adminProcedure.query(async () => {
    return getAllLeads();
  }),
});
