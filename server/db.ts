import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "./env";
import * as schema from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// Neon serverless HTTP driver — works perfectly in Vercel serverless functions
const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// ─── Default platform templates ──────────────────────────────
export const DEFAULT_PLATFORMS = [
  { platformId: "facebook", name: "Facebook", shortName: "Facebook", icon: "f", color: "#1877F2", url: "", reviewCount: 0, targetCount: 25, enabled: true, sortOrder: 1 },
  { platformId: "yelp", name: "Yelp", shortName: "Yelp", icon: "y", color: "#D32323", url: "", reviewCount: 0, targetCount: 20, enabled: true, sortOrder: 2 },
  { platformId: "bbb", name: "Better Business Bureau", shortName: "BBB", icon: "b", color: "#003F8F", url: "", reviewCount: 0, targetCount: 10, enabled: true, sortOrder: 3 },
  { platformId: "google", name: "Google", shortName: "Google", icon: "g", color: "#4285F4", url: "", reviewCount: 0, targetCount: 50, enabled: false, sortOrder: 4 },
  { platformId: "angi", name: "Angi", shortName: "Angi", icon: "a", color: "#FF6B35", url: "", reviewCount: 0, targetCount: 15, enabled: false, sortOrder: 5 },
  { platformId: "trustpilot", name: "Trustpilot", shortName: "Trustpilot", icon: "t", color: "#00B67A", url: "", reviewCount: 0, targetCount: 20, enabled: false, sortOrder: 6 },
  { platformId: "cargurus", name: "CarGurus", shortName: "CarGurus", icon: "c", color: "#E37222", url: "", reviewCount: 0, targetCount: 10, enabled: false, sortOrder: 7 },
];

// ─── Plan tier helpers ────────────────────────────────────────
const TRIAL_DURATION_DAYS = 14;

export function isTrialExpired(trialStartedAt: Date): boolean {
  const now = new Date();
  const trialEnd = new Date(trialStartedAt);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);
  return now > trialEnd;
}

export function getTrialDaysLeft(trialStartedAt: Date): number {
  const now = new Date();
  const trialEnd = new Date(trialStartedAt);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);
  const msLeft = trialEnd.getTime() - now.getTime();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
}

export function canAccessPlatform(platformId: string, planTier: string, trialStartedAt: Date): boolean {
  const trialPlatforms = ["facebook", "yelp", "bbb"];
  if (trialPlatforms.includes(platformId)) return true;
  if (planTier === "trial") return !isTrialExpired(trialStartedAt);
  return ["core", "pro"].includes(planTier);
}

// ─── User helpers ─────────────────────────────────────────────
export async function getUserById(id: number) {
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, id));
  return rows[0] ?? null;
}

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
  return rows[0] ?? null;
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  name?: string;
  role?: "user" | "admin";
}) {
  const result = await db.insert(schema.users).values({
    email: data.email.toLowerCase(),
    passwordHash: data.passwordHash,
    name: data.name ?? null,
    role: data.role ?? "user",
  }).returning();
  return result[0];
}

// ─── Business helpers ─────────────────────────────────────────
export async function getBusinessBySlug(slug: string) {
  const rows = await db.select().from(schema.businesses).where(eq(schema.businesses.slug, slug));
  return rows[0] ?? null;
}

export async function getBusinessById(id: number) {
  const rows = await db.select().from(schema.businesses).where(eq(schema.businesses.id, id));
  return rows[0] ?? null;
}

export async function getBusinessesByOwner(ownerId: number) {
  return db.select().from(schema.businesses).where(eq(schema.businesses.ownerId, ownerId));
}

export async function getAllBusinesses() {
  return db.select().from(schema.businesses).orderBy(desc(schema.businesses.createdAt));
}

export async function createBusiness(data: {
  ownerId: number;
  name: string;
  slug: string;
  businessType?: string;
  phone?: string;
  email?: string;
  planTier?: "trial" | "kit" | "core" | "pro";
}) {
  const result = await db.insert(schema.businesses).values({
    ownerId: data.ownerId,
    name: data.name,
    slug: data.slug,
    businessType: data.businessType ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    planTier: data.planTier ?? "trial",
  }).returning();
  const business = result[0];

  // Seed default platforms
  if (business) {
    await db.insert(schema.platforms).values(
      DEFAULT_PLATFORMS.map((p, i) => ({
        businessId: business.id,
        platformId: p.platformId,
        name: p.name,
        shortName: p.shortName,
        icon: p.icon,
        color: p.color,
        url: "",
        reviewCount: 0,
        targetCount: p.targetCount,
        enabled: p.enabled,
        sortOrder: i + 1,
      }))
    );
  }

  return business;
}

export async function updateBusiness(id: number, data: Partial<{
  name: string;
  slug: string;
  businessType: string;
  phone: string;
  email: string;
  ownerPin: string;
  tagline: string;
  keywords: string;
  planTier: "trial" | "kit" | "core" | "pro";
  trialStartedAt: Date;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
}>) {
  const result = await db.update(schema.businesses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(schema.businesses.id, id))
    .returning();
  return result[0];
}

export async function deleteBusinessById(id: number) {
  // Delete child records first
  await db.delete(schema.platforms).where(eq(schema.platforms.businessId, id));
  await db.delete(schema.staff).where(eq(schema.staff.businessId, id));
  await db.delete(schema.leads).where(eq(schema.leads.businessId, id));
  await db.delete(schema.businesses).where(eq(schema.businesses.id, id));
}

// ─── Platform helpers ─────────────────────────────────────────
export async function getPlatformsByBusiness(businessId: number) {
  return db.select().from(schema.platforms)
    .where(eq(schema.platforms.businessId, businessId))
    .orderBy(schema.platforms.sortOrder);
}

export async function upsertPlatform(businessId: number, platformId: string, data: Partial<{
  url: string;
  enabled: boolean;
  reviewCount: number;
  targetCount: number;
}>) {
  const existing = await db.select().from(schema.platforms)
    .where(and(eq(schema.platforms.businessId, businessId), eq(schema.platforms.platformId, platformId)));

  if (existing.length > 0) {
    const result = await db.update(schema.platforms)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(schema.platforms.businessId, businessId), eq(schema.platforms.platformId, platformId)))
      .returning();
    return result[0];
  } else {
    const template = DEFAULT_PLATFORMS.find(p => p.platformId === platformId);
    const result = await db.insert(schema.platforms).values({
      businessId,
      platformId,
      name: template?.name ?? platformId,
      shortName: template?.shortName ?? platformId,
      icon: template?.icon ?? platformId[0],
      color: template?.color ?? "#666",
      url: data.url ?? "",
      reviewCount: data.reviewCount ?? 0,
      targetCount: data.targetCount ?? 20,
      enabled: data.enabled ?? false,
      sortOrder: template?.sortOrder ?? 99,
    }).returning();
    return result[0];
  }
}

// ─── Staff helpers ────────────────────────────────────────────
export async function getStaffByBusiness(businessId: number) {
  return db.select().from(schema.staff)
    .where(eq(schema.staff.businessId, businessId))
    .orderBy(desc(schema.staff.reviews));
}

export async function upsertStaffMember(businessId: number, name: string, data: { shares?: number; reviews?: number }) {
  const existing = await db.select().from(schema.staff)
    .where(and(eq(schema.staff.businessId, businessId), eq(schema.staff.name, name)));

  if (existing.length > 0) {
    const current = existing[0];
    const result = await db.update(schema.staff)
      .set({
        shares: (current.shares ?? 0) + (data.shares ?? 0),
        reviews: (current.reviews ?? 0) + (data.reviews ?? 0),
      })
      .where(eq(schema.staff.id, current.id))
      .returning();
    return result[0];
  } else {
    const result = await db.insert(schema.staff).values({
      businessId,
      name,
      shares: data.shares ?? 0,
      reviews: data.reviews ?? 0,
    }).returning();
    return result[0];
  }
}

// ─── Lead helpers ─────────────────────────────────────────────
export async function createLead(data: {
  businessId?: number;
  name?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  website?: string;
  source?: string;
  smsConsent?: boolean;
  marketingConsent?: boolean;
}) {
  const result = await db.insert(schema.leads).values({
    businessId: data.businessId ?? null,
    name: data.name ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    businessName: data.businessName ?? null,
    website: data.website ?? null,
    source: data.source ?? "landing",
    smsConsent: data.smsConsent ?? false,
    marketingConsent: data.marketingConsent ?? false,
  }).returning();
  return result[0];
}

export async function getLeadsByBusiness(businessId: number) {
  return db.select().from(schema.leads)
    .where(eq(schema.leads.businessId, businessId))
    .orderBy(desc(schema.leads.createdAt));
}

export async function getAllLeads() {
  return db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt));
}
