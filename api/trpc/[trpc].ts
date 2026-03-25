import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { pgTable, serial, varchar, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { eq, desc } from "drizzle-orm";

// ─── Schema ──────────────────────────────────────────────────
const roleEnum = pgEnum("role", ["user", "admin"]);
const planTierEnum = pgEnum("plan_tier", ["trial", "kit", "core", "pro"]);

const users = pgTable("arh_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: text("name"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const businesses = pgTable("arh_businesses", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  businessType: varchar("business_type", { length: 100 }),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  ownerPin: varchar("owner_pin", { length: 10 }).notNull().default("1234"),
  tagline: text("tagline"),
  keywords: varchar("keywords", { length: 1000 }).default("[]"),
  planTier: planTierEnum("plan_tier").notNull().default("trial"),
  trialStartedAt: timestamp("trial_started_at").defaultNow().notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 100 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const platforms = pgTable("arh_platforms", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  platformId: varchar("platform_id", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  shortName: varchar("short_name", { length: 50 }),
  icon: varchar("icon", { length: 10 }),
  color: varchar("color", { length: 20 }),
  url: text("url"),
  reviewCount: integer("review_count").notNull().default(0),
  targetCount: integer("target_count").notNull().default(20),
  enabled: boolean("enabled").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const staff = pgTable("arh_staff", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  shares: integer("shares").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

const leads = pgTable("arh_leads", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id"),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  businessName: varchar("business_name", { length: 255 }),
  website: varchar("website", { length: 255 }),
  source: varchar("source", { length: 50 }).default("landing"),
  smsConsent: boolean("sms_consent").default(false),
  marketingConsent: boolean("marketing_consent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── DB ──────────────────────────────────────────────────────
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const DEFAULT_PLATFORMS = [
  { platformId: "facebook", name: "Facebook", shortName: "Facebook", icon: "f", color: "#1877F2", url: "", reviewCount: 0, targetCount: 25, enabled: true, sortOrder: 1 },
  { platformId: "yelp", name: "Yelp", shortName: "Yelp", icon: "Y", color: "#FF1A1A", url: "", reviewCount: 0, targetCount: 20, enabled: true, sortOrder: 2 },
  { platformId: "bbb", name: "Better Business Bureau", shortName: "BBB", icon: "B", color: "#003087", url: "", reviewCount: 0, targetCount: 10, enabled: true, sortOrder: 3 },
  { platformId: "google", name: "Google Business", shortName: "Google", icon: "G", color: "#4285F4", url: "", reviewCount: 0, targetCount: 50, enabled: false, sortOrder: 4 },
  { platformId: "angi", name: "Angi", shortName: "Angi", icon: "A", color: "#FF6153", url: "", reviewCount: 0, targetCount: 15, enabled: false, sortOrder: 5 },
  { platformId: "trustpilot", name: "Trustpilot", shortName: "Trustpilot", icon: "T", color: "#00B67A", url: "", reviewCount: 0, targetCount: 10, enabled: false, sortOrder: 6 },
];

// ─── Auth ────────────────────────────────────────────────────
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || "arh-dev-secret");

async function signToken(payload: { userId: number; email: string; role: string }) {
  return new SignJWT({ ...payload }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(jwtSecret);
}

async function verifyToken(token: string) {
  try { const { payload } = await jwtVerify(token, jwtSecret); return payload as any; }
  catch { return null; }
}

function parseCookies(cookieHeader: string): Record<string, string> {
  return Object.fromEntries(cookieHeader.split(";").map(c => { const [k, ...v] = c.trim().split("="); return [k, v.join("=")]; }).filter(([k]) => k));
}

// ─── tRPC ────────────────────────────────────────────────────
async function createContext({ req }: { req: Request }) {
  let user: any = null;
  const cookies = parseCookies(req.headers.get("cookie") || "");
  const token = cookies["arh_token"];
  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      const rows = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
      user = rows[0] || null;
    }
  }
  return { user, req };
}

type Context = Awaited<ReturnType<typeof createContext>>;
const t = initTRPC.context<Context>().create();
const publicProcedure = t.procedure;
const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// ─── Routers ─────────────────────────────────────────────────
const authRouter = t.router({
  signup: publicProcedure.input(z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) })).mutation(async ({ input }) => {
    const existing = await db.select().from(users).where(eq(users.email, input.email.toLowerCase())).limit(1);
    if (existing[0]) throw new Error("Email already exists");
    const passwordHash = await bcrypt.hash(input.password, 12);
    const result = await db.insert(users).values({ email: input.email.toLowerCase(), passwordHash, name: input.name, role: "user" }).returning({ id: users.id, email: users.email, name: users.name, role: users.role });
    const user = result[0];
    const token = await signToken({ userId: user.id, email: user.email, role: user.role });
    return { success: true, user, token };
  }),
  login: publicProcedure.input(z.object({ email: z.string().email(), password: z.string() })).mutation(async ({ input }) => {
    const rows = await db.select().from(users).where(eq(users.email, input.email.toLowerCase())).limit(1);
    const user = rows[0];
    if (!user) throw new Error("Invalid credentials");
    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");
    const token = await signToken({ userId: user.id, email: user.email, role: user.role });
    return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role }, token };
  }),
  logout: publicProcedure.mutation(() => ({ success: true })),
  me: publicProcedure.query(({ ctx }) => ctx.user ? { id: ctx.user.id, email: ctx.user.email, name: ctx.user.name, role: ctx.user.role } : null),
});

const businessRouter = t.router({
  create: protectedProcedure.input(z.object({ name: z.string().min(2), slug: z.string().optional(), businessType: z.string().optional(), phone: z.string().optional(), email: z.string().optional(), tagline: z.string().optional(), keywords: z.array(z.string()).optional() })).mutation(async ({ input, ctx }) => {
    const slug = (input.slug || input.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
    const existing = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
    if (existing[0]) throw new Error("Slug taken, try again");
    const result = await db.insert(businesses).values({ ownerId: ctx.user.id, name: input.name, slug, businessType: input.businessType || "", phone: input.phone || "", email: input.email || "", tagline: input.tagline || "", keywords: JSON.stringify(input.keywords || []) }).returning({ id: businesses.id });
    await db.insert(platforms).values(DEFAULT_PLATFORMS.map(p => ({ ...p, businessId: result[0].id })));
    const biz = await db.select().from(businesses).where(eq(businesses.id, result[0].id)).limit(1);
    return biz[0];
  }),
  mine: protectedProcedure.query(async ({ ctx }) => db.select().from(businesses).where(eq(businesses.ownerId, ctx.user.id)).orderBy(desc(businesses.createdAt))),
  myBusinesses: protectedProcedure.query(async ({ ctx }) => db.select().from(businesses).where(eq(businesses.ownerId, ctx.user.id)).orderBy(desc(businesses.createdAt))),
  getPublic: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const biz = await db.select().from(businesses).where(eq(businesses.slug, input.slug)).limit(1);
    if (!biz[0]) return null;
    const plats = await db.select().from(platforms).where(eq(platforms.businessId, biz[0].id)).orderBy(platforms.sortOrder);
    return { ...biz[0], platforms: plats };
  }),
  bySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const biz = await db.select().from(businesses).where(eq(businesses.slug, input.slug)).limit(1);
    if (!biz[0]) return null;
    const plats = await db.select().from(platforms).where(eq(platforms.businessId, biz[0].id)).orderBy(platforms.sortOrder);
    return { ...biz[0], platforms: plats };
  }),
  platforms: protectedProcedure.input(z.object({ businessId: z.number() })).query(async ({ input }) => db.select().from(platforms).where(eq(platforms.businessId, input.businessId)).orderBy(platforms.sortOrder)),
  getPlatforms: protectedProcedure.input(z.object({ businessId: z.number() })).query(async ({ input }) => db.select().from(platforms).where(eq(platforms.businessId, input.businessId)).orderBy(platforms.sortOrder)),
  updatePlatform: protectedProcedure.input(z.object({ id: z.number(), url: z.string().optional(), enabled: z.boolean().optional(), reviewCount: z.number().optional(), targetCount: z.number().optional() })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    const update: any = {};
    if (data.url !== undefined) update.url = data.url;
    if (data.enabled !== undefined) update.enabled = data.enabled;
    if (data.reviewCount !== undefined) update.reviewCount = data.reviewCount;
    if (data.targetCount !== undefined) update.targetCount = data.targetCount;
    await db.update(platforms).set(update).where(eq(platforms.id, id));
    return { success: true };
  }),
  staff: protectedProcedure.input(z.object({ businessId: z.number() })).query(async ({ input }) => db.select().from(staff).where(eq(staff.businessId, input.businessId)).orderBy(desc(staff.reviews))),
  getStaff: protectedProcedure.input(z.object({ businessId: z.number() })).query(async ({ input }) => db.select().from(staff).where(eq(staff.businessId, input.businessId)).orderBy(desc(staff.reviews))),
  addStaff: protectedProcedure.input(z.object({ businessId: z.number(), name: z.string() })).mutation(async ({ input }) => {
    const result = await db.insert(staff).values({ businessId: input.businessId, name: input.name }).returning();
    return result[0];
  }),
  leads: protectedProcedure.input(z.object({ businessId: z.number() })).query(async ({ input }) => db.select().from(leads).where(eq(leads.businessId, input.businessId)).orderBy(desc(leads.createdAt))),
  recordStaffActivity: protectedProcedure.input(z.object({ id: z.number(), shares: z.number().optional(), reviews: z.number().optional() })).mutation(async ({ input }) => {
    const update: any = {};
    if (input.shares !== undefined) update.shares = input.shares;
    if (input.reviews !== undefined) update.reviews = input.reviews;
    await db.update(staff).set(update).where(eq(staff.id, input.id));
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({ id: z.number(), name: z.string().optional(), businessType: z.string().optional(), phone: z.string().optional(), email: z.string().optional(), ownerPin: z.string().optional(), tagline: z.string().optional(), keywords: z.array(z.string()).optional() })).mutation(async ({ input }) => {
    const { id, ...data } = input;
    const update: any = { ...data };
    if (data.keywords) update.keywords = JSON.stringify(data.keywords);
    await db.update(businesses).set(update).where(eq(businesses.id, id));
    const biz = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
    return biz[0];
  }),
  submitLead: publicProcedure.input(z.object({ businessId: z.number().optional(), name: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), businessName: z.string().optional(), website: z.string().optional(), source: z.string().optional(), smsConsent: z.boolean().optional(), marketingConsent: z.boolean().optional() })).mutation(async ({ input }) => {
    await db.insert(leads).values(input);
    return { success: true };
  }),
});

const adminRouter = t.router({
  createBusiness: protectedProcedure.input(z.object({ ownerName: z.string(), ownerEmail: z.string().email(), ownerPassword: z.string().min(8), businessName: z.string(), planTier: z.enum(["trial", "kit", "core", "pro"]).optional() })).mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    let userRows = await db.select().from(users).where(eq(users.email, input.ownerEmail.toLowerCase())).limit(1);
    let owner = userRows[0];
    if (!owner) {
      const hash = await bcrypt.hash(input.ownerPassword, 12);
      const result = await db.insert(users).values({ email: input.ownerEmail.toLowerCase(), passwordHash: hash, name: input.ownerName, role: "user" }).returning({ id: users.id, email: users.email, name: users.name, role: users.role });
      owner = result[0] as any;
    }
    const slug = input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Math.random().toString(36).slice(2, 6);
    const bizResult = await db.insert(businesses).values({ ownerId: owner.id, name: input.businessName, slug, planTier: input.planTier || "trial" }).returning({ id: businesses.id });
    await db.insert(platforms).values(DEFAULT_PLATFORMS.map(p => ({ ...p, businessId: bizResult[0].id })));
    const biz = await db.select().from(businesses).where(eq(businesses.id, bizResult[0].id)).limit(1);
    return biz[0];
  }),
  updateBusinessPlan: protectedProcedure.input(z.object({ businessId: z.number(), planTier: z.enum(["trial", "kit", "core", "pro"]) })).mutation(async ({ input, ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    await db.update(businesses).set({ planTier: input.planTier }).where(eq(businesses.id, input.businessId));
    return { success: true };
  }),
  allBusinesses: protectedProcedure.query(async ({ ctx }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); const biz = await db.select().from(businesses).orderBy(desc(businesses.createdAt)); const allUsers = await db.select({ id: users.id, email: users.email, name: users.name }).from(users); return biz.map(b => ({ ...b, ownerEmail: allUsers.find(u => u.id === b.ownerId)?.email || "", ownerName: allUsers.find(u => u.id === b.ownerId)?.name || "" })); }),
  getAllBusinesses: protectedProcedure.query(async ({ ctx }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); const biz = await db.select().from(businesses).orderBy(desc(businesses.createdAt)); const allUsers = await db.select({ id: users.id, email: users.email, name: users.name }).from(users); return biz.map(b => ({ ...b, ownerEmail: allUsers.find(u => u.id === b.ownerId)?.email || "", ownerName: allUsers.find(u => u.id === b.ownerId)?.name || "" })); }),
  allLeads: protectedProcedure.query(async ({ ctx }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); return db.select().from(leads).orderBy(desc(leads.createdAt)); }),
  getAllLeads: protectedProcedure.query(async ({ ctx }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); return db.select().from(leads).orderBy(desc(leads.createdAt)); }),
  allUsers: protectedProcedure.query(async ({ ctx }) => { if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" }); return db.select({ id: users.id, email: users.email, name: users.name, role: users.role, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)); }),
});

const appRouter = t.router({ auth: authRouter, business: businessRouter, admin: adminRouter });
export type AppRouter = typeof appRouter;

// ─── Vercel Edge/Serverless Handler ──────────────────────────
export const config = { runtime: "nodejs", maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "app.autorephero.com";
  const url = `${proto}://${host}${req.url}`;
  
  const fetchReq = new Request(url, {
    method: req.method || "GET",
    headers: req.headers as any,
    body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
  });

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req: fetchReq,
    router: appRouter,
    createContext: () => createContext({ req: fetchReq }),
  });

  // Copy response headers
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(response.status);
  const body = await response.text();
  res.send(body);
}
