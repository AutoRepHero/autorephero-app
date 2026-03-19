import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "./env";
import * as schema from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// Serverless-compatible: create a single connection (not pool) so Vercel
// functions don't hang waiting for pool cleanup on cold starts.
// TiDB/PlanetScale require ssl in production.
function createDb() {
  const connectionString = env.DATABASE_URL;
  // Parse ssl requirement from URL or default to required in production
  const pool = mysql.createPool({
    uri: connectionString,
    ssl: env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 1, // Minimal pool for serverless
    queueLimit: 0,
  });
  return drizzle(pool, { schema, mode: "default" });
}

export const db = createDb();

// ─── Default platform templates ──────────────────────────────
export const DEFAULT_PLATFORMS = [
  { platformId: "facebook", name: "Facebook", shortName: "Facebook", icon: "f", color: "#1877F2", url: "", reviewCount: 0, targetCount: 25, enabled: true, sortOrder: 1 },
  { platformId: "yelp", name: "Yelp", shortName: "Yelp", icon: "Y", color: "#FF1A1A", url: "", reviewCount: 0, targetCount: 20, enabled: true, sortOrder: 2 },
  { platformId: "bbb", name: "Better Business Bureau", shortName: "BBB", icon: "B", color: "#003087", url: "", reviewCount: 0, targetCount: 10, enabled: true, sortOrder: 3 },
  { platformId: "google", name: "Google Business", shortName: "Google", icon: "G", color: "#4285F4", url: "", reviewCount: 0, targetCount: 50, enabled: false, sortOrder: 4 },
  { platformId: "angi", name: "Angi", shortName: "Angi", icon: "A", color: "#FF6153", url: "", reviewCount: 0, targetCount: 15, enabled: false, sortOrder: 5 },
  { platformId: "trustpilot", name: "Trustpilot", shortName: "Trustpilot", icon: "T", color: "#00B67A", url: "", reviewCount: 0, targetCount: 10, enabled: false, sortOrder: 6 },
  { platformId: "cargurus", name: "CarGurus", shortName: "CarGurus", icon: "🚗", color: "#6C2DC7", url: "", reviewCount: 0, targetCount: 15, enabled: false, sortOrder: 7 },
];

// ─── User helpers ─────────────────────────────────────────────
export async function getUserByEmail(email: string) {
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase())).limit(1);
  return rows[0] || null;
}

export async function getUserById(id: number) {
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return rows[0] || null;
}

export async function createUser(data: { email: string; passwordHash: string; name: string }) {
  const result = await db.insert(schema.users).values({
    email: data.email.toLowerCase(),
    passwordHash: data.passwordHash,
    name: data.name,
    role: "user",
  });
  const id = (result as any)[0].insertId as number;
  return getUserById(id);
}

// ─── Business helpers ─────────────────────────────────────────
export async function getBusinessBySlug(slug: string) {
  const rows = await db.select().from(schema.businesses).where(eq(schema.businesses.slug, slug)).limit(1);
  return rows[0] || null;
}

export async function getBusinessById(id: number) {
  const rows = await db.select().from(schema.businesses).where(eq(schema.businesses.id, id)).limit(1);
  return rows[0] || null;
}

export async function getBusinessesByOwner(ownerId: number) {
  return db.select().from(schema.businesses).where(eq(schema.businesses.ownerId, ownerId)).orderBy(desc(schema.businesses.createdAt));
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
  ownerPin?: string;
  tagline?: string;
  keywords?: string[];
  planTier?: "trial" | "kit" | "core" | "pro";
}) {
  const result = await db.insert(schema.businesses).values({
    ownerId: data.ownerId,
    name: data.name,
    slug: data.slug,
    businessType: data.businessType || "",
    phone: data.phone || "",
    email: data.email || "",
    ownerPin: data.ownerPin || "1234",
    tagline: data.tagline || "",
    keywords: JSON.stringify(data.keywords || []),
    planTier: data.planTier || "trial",
  });
  const id = (result as any)[0].insertId as number;
  // Seed default platforms
  await db.insert(schema.platforms).values(
    DEFAULT_PLATFORMS.map(p => ({ ...p, businessId: id }))
  );
  return getBusinessById(id);
}

export async function deleteBusinessById(id: number) {
  await db.delete(schema.platforms).where(eq(schema.platforms.businessId, id));
  await db.delete(schema.staff).where(eq(schema.staff.businessId, id));
  await db.delete(schema.leads).where(eq(schema.leads.businessId, id));
  await db.delete(schema.businesses).where(eq(schema.businesses.id, id));
}

export async function updateBusiness(id: number, data: Partial<{
  name: string;
  businessType: string;
  phone: string;
  email: string;
  ownerPin: string;
  tagline: string;
  keywords: string[];
  planTier: "trial" | "kit" | "core" | "pro";
  trialStartedAt: Date;
}>) {
  const update: Record<string, any> = { ...data };
  if (data.keywords) update.keywords = JSON.stringify(data.keywords);
  await db.update(schema.businesses).set(update).where(eq(schema.businesses.id, id));
  return getBusinessById(id);
}

// ─── Platform helpers ─────────────────────────────────────────
export async function getPlatformsByBusiness(businessId: number) {
  return db.select().from(schema.platforms)
    .where(eq(schema.platforms.businessId, businessId))
    .orderBy(schema.platforms.sortOrder);
}

export async function updatePlatform(id: number, data: Partial<{
  url: string;
  reviewCount: number;
  targetCount: number;
  enabled: boolean;
  sortOrder: number;
}>) {
  await db.update(schema.platforms).set(data).where(eq(schema.platforms.id, id));
}

// ─── Staff helpers ────────────────────────────────────────────
export async function getStaffByBusiness(businessId: number) {
  return db.select().from(schema.staff)
    .where(eq(schema.staff.businessId, businessId))
    .orderBy(desc(schema.staff.reviews));
}

export async function createStaff(businessId: number, name: string) {
  const result = await db.insert(schema.staff).values({ businessId, name });
  const id = (result as any)[0].insertId as number;
  const rows = await db.select().from(schema.staff).where(eq(schema.staff.id, id)).limit(1);
  return rows[0];
}

export async function updateStaff(id: number, data: { shares?: number; reviews?: number }) {
  await db.update(schema.staff).set(data).where(eq(schema.staff.id, id));
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
  await db.insert(schema.leads).values(data);
}

export async function getLeadsByBusiness(businessId: number) {
  return db.select().from(schema.leads)
    .where(eq(schema.leads.businessId, businessId))
    .orderBy(desc(schema.leads.createdAt));
}

export async function getAllLeads() {
  return db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt));
}

// ─── Trial helpers ────────────────────────────────────────────
export function isTrialExpired(business: { planTier: string; trialStartedAt: Date }) {
  if (business.planTier !== "trial") return false;
  const days = (Date.now() - new Date(business.trialStartedAt).getTime()) / (1000 * 60 * 60 * 24);
  return days > 14;
}
