"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// api/trpc.ts
var trpc_exports = {};
__export(trpc_exports, {
  default: () => handler
});
module.exports = __toCommonJS(trpc_exports);
var import_fetch = require("@trpc/server/adapters/fetch");

// server/trpc.ts
var import_server = require("@trpc/server");
var import_superjson = __toESM(require("superjson"), 1);

// server/auth.ts
var import_jose = require("jose");

// server/env.ts
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var env = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || "arh-dev-secret-change-in-prod",
  NODE_ENV: process.env.NODE_ENV || "development",
  OWNER_EMAIL: process.env.OWNER_EMAIL || "chuck@autorephero.com",
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_KIT_LINK: "https://pay.chuckzonline.com/b/eVq28jfRU3tl57VdBu63K01",
  STRIPE_CORE_LINK: "https://pay.chuckzonline.com/b/4gMeV5eNQ5Bt0RF1SM63K02"
};

// server/auth.ts
var secret = new TextEncoder().encode(env.JWT_SECRET);
async function signToken(payload) {
  return new import_jose.SignJWT({ ...payload }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret);
}
async function verifyToken(token) {
  try {
    const { payload } = await (0, import_jose.jwtVerify)(token, secret);
    return payload;
  } catch {
    return null;
  }
}
function parseCookies(cookieHeader) {
  return Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k.trim(), decodeURIComponent(v.join("="))];
    })
  );
}

// server/db.ts
var import_serverless = require("@neondatabase/serverless");
var import_neon_http = require("drizzle-orm/neon-http");

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  businesses: () => businesses,
  leads: () => leads,
  planTierEnum: () => planTierEnum,
  platforms: () => platforms,
  roleEnum: () => roleEnum,
  staff: () => staff,
  users: () => users
});
var import_pg_core = require("drizzle-orm/pg-core");
var roleEnum = (0, import_pg_core.pgEnum)("role", ["user", "admin"]);
var planTierEnum = (0, import_pg_core.pgEnum)("plan_tier", ["trial", "kit", "core", "pro"]);
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  email: (0, import_pg_core.varchar)("email", { length: 320 }).notNull().unique(),
  passwordHash: (0, import_pg_core.varchar)("password_hash", { length: 255 }).notNull(),
  name: (0, import_pg_core.text)("name"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var businesses = (0, import_pg_core.pgTable)("businesses", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  ownerId: (0, import_pg_core.integer)("owner_id").notNull(),
  // FK → users.id
  name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
  slug: (0, import_pg_core.varchar)("slug", { length: 100 }).notNull().unique(),
  // URL-safe identifier
  businessType: (0, import_pg_core.varchar)("business_type", { length: 100 }),
  phone: (0, import_pg_core.varchar)("phone", { length: 30 }),
  email: (0, import_pg_core.varchar)("email", { length: 320 }),
  ownerPin: (0, import_pg_core.varchar)("owner_pin", { length: 10 }).notNull().default("1234"),
  tagline: (0, import_pg_core.text)("tagline"),
  keywords: (0, import_pg_core.varchar)("keywords", { length: 1e3 }).default("[]"),
  planTier: planTierEnum("plan_tier").notNull().default("trial"),
  trialStartedAt: (0, import_pg_core.timestamp)("trial_started_at").defaultNow().notNull(),
  stripeCustomerId: (0, import_pg_core.varchar)("stripe_customer_id", { length: 100 }),
  stripeSubscriptionId: (0, import_pg_core.varchar)("stripe_subscription_id", { length: 100 }),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var platforms = (0, import_pg_core.pgTable)("platforms", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  businessId: (0, import_pg_core.integer)("business_id").notNull(),
  // FK → businesses.id
  platformId: (0, import_pg_core.varchar)("platform_id", { length: 50 }).notNull(),
  // e.g. "google", "yelp"
  name: (0, import_pg_core.varchar)("name", { length: 100 }).notNull(),
  shortName: (0, import_pg_core.varchar)("short_name", { length: 50 }),
  icon: (0, import_pg_core.varchar)("icon", { length: 10 }),
  color: (0, import_pg_core.varchar)("color", { length: 20 }),
  url: (0, import_pg_core.text)("url"),
  reviewCount: (0, import_pg_core.integer)("review_count").notNull().default(0),
  targetCount: (0, import_pg_core.integer)("target_count").notNull().default(20),
  enabled: (0, import_pg_core.boolean)("enabled").notNull().default(false),
  sortOrder: (0, import_pg_core.integer)("sort_order").notNull().default(0),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
  updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
});
var staff = (0, import_pg_core.pgTable)("staff", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  businessId: (0, import_pg_core.integer)("business_id").notNull(),
  // FK → businesses.id
  name: (0, import_pg_core.varchar)("name", { length: 100 }).notNull(),
  shares: (0, import_pg_core.integer)("shares").notNull().default(0),
  reviews: (0, import_pg_core.integer)("reviews").notNull().default(0),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});
var leads = (0, import_pg_core.pgTable)("leads", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  businessId: (0, import_pg_core.integer)("business_id"),
  // nullable — global leads from landing page
  name: (0, import_pg_core.varchar)("name", { length: 100 }),
  email: (0, import_pg_core.varchar)("email", { length: 320 }),
  phone: (0, import_pg_core.varchar)("phone", { length: 30 }),
  businessName: (0, import_pg_core.varchar)("business_name", { length: 255 }),
  website: (0, import_pg_core.varchar)("website", { length: 255 }),
  source: (0, import_pg_core.varchar)("source", { length: 50 }).default("landing"),
  smsConsent: (0, import_pg_core.boolean)("sms_consent").default(false),
  marketingConsent: (0, import_pg_core.boolean)("marketing_consent").default(false),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
});

// server/db.ts
var import_drizzle_orm = require("drizzle-orm");
var _db = null;
function getDb() {
  if (!_db) {
    if (!env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set. Add it in Vercel project settings.");
    }
    const sql = (0, import_serverless.neon)(env.DATABASE_URL);
    _db = (0, import_neon_http.drizzle)(sql, { schema: schema_exports });
  }
  return _db;
}
var db = new Proxy({}, {
  get(_target, prop) {
    return getDb()[prop];
  }
});
var DEFAULT_PLATFORMS = [
  { platformId: "facebook", name: "Facebook", shortName: "Facebook", icon: "f", color: "#1877F2", url: "", reviewCount: 0, targetCount: 25, enabled: true, sortOrder: 1 },
  { platformId: "yelp", name: "Yelp", shortName: "Yelp", icon: "y", color: "#D32323", url: "", reviewCount: 0, targetCount: 20, enabled: true, sortOrder: 2 },
  { platformId: "bbb", name: "Better Business Bureau", shortName: "BBB", icon: "b", color: "#003F8F", url: "", reviewCount: 0, targetCount: 10, enabled: true, sortOrder: 3 },
  { platformId: "google", name: "Google", shortName: "Google", icon: "g", color: "#4285F4", url: "", reviewCount: 0, targetCount: 50, enabled: false, sortOrder: 4 },
  { platformId: "angi", name: "Angi", shortName: "Angi", icon: "a", color: "#FF6B35", url: "", reviewCount: 0, targetCount: 15, enabled: false, sortOrder: 5 },
  { platformId: "trustpilot", name: "Trustpilot", shortName: "Trustpilot", icon: "t", color: "#00B67A", url: "", reviewCount: 0, targetCount: 20, enabled: false, sortOrder: 6 },
  { platformId: "cargurus", name: "CarGurus", shortName: "CarGurus", icon: "c", color: "#E37222", url: "", reviewCount: 0, targetCount: 10, enabled: false, sortOrder: 7 }
];
var TRIAL_DURATION_DAYS = 14;
function isTrialExpired(trialStartedAt) {
  const now = /* @__PURE__ */ new Date();
  const trialEnd = new Date(trialStartedAt);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);
  return now > trialEnd;
}
async function getUserById(id) {
  const rows = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, id));
  return rows[0] ?? null;
}
async function getUserByEmail(email) {
  const rows = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.email, email.toLowerCase()));
  return rows[0] ?? null;
}
async function createUser(data) {
  const result = await db.insert(users).values({
    email: data.email.toLowerCase(),
    passwordHash: data.passwordHash,
    name: data.name ?? null,
    role: data.role ?? "user"
  }).returning();
  return result[0];
}
async function getBusinessBySlug(slug) {
  const rows = await db.select().from(businesses).where((0, import_drizzle_orm.eq)(businesses.slug, slug));
  return rows[0] ?? null;
}
async function getBusinessById(id) {
  const rows = await db.select().from(businesses).where((0, import_drizzle_orm.eq)(businesses.id, id));
  return rows[0] ?? null;
}
async function getBusinessesByOwner(ownerId) {
  return db.select().from(businesses).where((0, import_drizzle_orm.eq)(businesses.ownerId, ownerId));
}
async function getAllBusinesses() {
  return db.select().from(businesses).orderBy((0, import_drizzle_orm.desc)(businesses.createdAt));
}
async function createBusiness(data) {
  const result = await db.insert(businesses).values({
    ownerId: data.ownerId,
    name: data.name,
    slug: data.slug,
    businessType: data.businessType ?? null,
    phone: data.phone ?? null,
    email: data.email ?? null,
    planTier: data.planTier ?? "trial"
  }).returning();
  const business = result[0];
  if (business) {
    await db.insert(platforms).values(
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
        sortOrder: i + 1
      }))
    );
  }
  return business;
}
async function updateBusiness(id, data) {
  const result = await db.update(businesses).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.eq)(businesses.id, id)).returning();
  return result[0];
}
async function deleteBusinessById(id) {
  await db.delete(platforms).where((0, import_drizzle_orm.eq)(platforms.businessId, id));
  await db.delete(staff).where((0, import_drizzle_orm.eq)(staff.businessId, id));
  await db.delete(leads).where((0, import_drizzle_orm.eq)(leads.businessId, id));
  await db.delete(businesses).where((0, import_drizzle_orm.eq)(businesses.id, id));
}
async function getPlatformsByBusiness(businessId) {
  return db.select().from(platforms).where((0, import_drizzle_orm.eq)(platforms.businessId, businessId)).orderBy(platforms.sortOrder);
}
async function upsertPlatform(businessId, platformId, data) {
  const existing = await db.select().from(platforms).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(platforms.businessId, businessId), (0, import_drizzle_orm.eq)(platforms.platformId, platformId)));
  if (existing.length > 0) {
    const result = await db.update(platforms).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(platforms.businessId, businessId), (0, import_drizzle_orm.eq)(platforms.platformId, platformId))).returning();
    return result[0];
  } else {
    const template = DEFAULT_PLATFORMS.find((p) => p.platformId === platformId);
    const result = await db.insert(platforms).values({
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
      sortOrder: template?.sortOrder ?? 99
    }).returning();
    return result[0];
  }
}
async function getStaffByBusiness(businessId) {
  return db.select().from(staff).where((0, import_drizzle_orm.eq)(staff.businessId, businessId)).orderBy((0, import_drizzle_orm.desc)(staff.reviews));
}
async function upsertStaffMember(businessId, name, data) {
  const existing = await db.select().from(staff).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(staff.businessId, businessId), (0, import_drizzle_orm.eq)(staff.name, name)));
  if (existing.length > 0) {
    const current = existing[0];
    const result = await db.update(staff).set({
      shares: (current.shares ?? 0) + (data.shares ?? 0),
      reviews: (current.reviews ?? 0) + (data.reviews ?? 0)
    }).where((0, import_drizzle_orm.eq)(staff.id, current.id)).returning();
    return result[0];
  } else {
    const result = await db.insert(staff).values({
      businessId,
      name,
      shares: data.shares ?? 0,
      reviews: data.reviews ?? 0
    }).returning();
    return result[0];
  }
}
async function createLead(data) {
  const result = await db.insert(leads).values({
    businessId: data.businessId ?? null,
    name: data.name ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    businessName: data.businessName ?? null,
    website: data.website ?? null,
    source: data.source ?? "landing",
    smsConsent: data.smsConsent ?? false,
    marketingConsent: data.marketingConsent ?? false
  }).returning();
  return result[0];
}
async function getLeadsByBusiness(businessId) {
  return db.select().from(leads).where((0, import_drizzle_orm.eq)(leads.businessId, businessId)).orderBy((0, import_drizzle_orm.desc)(leads.createdAt));
}
async function getAllLeads() {
  return db.select().from(leads).orderBy((0, import_drizzle_orm.desc)(leads.createdAt));
}

// server/trpc.ts
async function createContext({ req, res }) {
  let user = null;
  const cookieHeader = req.headers.cookie || "";
  const cookies = parseCookies(cookieHeader);
  const token = cookies["arh_token"];
  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      user = await getUserById(payload.userId);
    }
  }
  return { req, res, user };
}
var t = import_server.initTRPC.context().create({ transformer: import_superjson.default });
var router = t.router;
var publicProcedure = t.procedure;
var protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new import_server.TRPCError({ code: "UNAUTHORIZED", message: "Please log in" });
  return next({ ctx: { ...ctx, user: ctx.user } });
});
var adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new import_server.TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

// server/routers/authRouter.ts
var import_zod = require("zod");
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var authRouter = router({
  // ─── Sign up ────────────────────────────────────────────────
  signup: publicProcedure.input(import_zod.z.object({
    name: import_zod.z.string().min(2),
    email: import_zod.z.string().email(),
    password: import_zod.z.string().min(8)
  })).mutation(async ({ input, ctx }) => {
    const existing = await getUserByEmail(input.email);
    if (existing) throw new Error("An account with that email already exists");
    const passwordHash = await import_bcryptjs.default.hash(input.password, 12);
    const user = await createUser({ email: input.email, passwordHash, name: input.name });
    if (!user) throw new Error("Failed to create account");
    const token = await signToken({ userId: user.id, email: user.email, role: user.role });
    ctx.res.setHeader("Set-Cookie", `arh_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`);
    return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }),
  // ─── Login ──────────────────────────────────────────────────
  login: publicProcedure.input(import_zod.z.object({
    email: import_zod.z.string().email(),
    password: import_zod.z.string()
  })).mutation(async ({ input, ctx }) => {
    const user = await getUserByEmail(input.email);
    if (!user) throw new Error("Invalid email or password");
    const valid = await import_bcryptjs.default.compare(input.password, user.passwordHash);
    if (!valid) throw new Error("Invalid email or password");
    const token = await signToken({ userId: user.id, email: user.email, role: user.role });
    ctx.res.setHeader("Set-Cookie", `arh_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`);
    return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }),
  // ─── Logout ─────────────────────────────────────────────────
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.setHeader("Set-Cookie", "arh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
    return { success: true };
  }),
  // ─── Me ─────────────────────────────────────────────────────
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) return null;
    return { id: ctx.user.id, email: ctx.user.email, name: ctx.user.name, role: ctx.user.role };
  })
});

// server/routers/businessRouter.ts
var import_zod2 = require("zod");
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 50);
}
var businessRouter = router({
  // ─── Public: get business config for review hub ─────────────
  getPublic: publicProcedure.input(import_zod2.z.object({ slug: import_zod2.z.string() })).query(async ({ input }) => {
    const biz = await getBusinessBySlug(input.slug);
    if (!biz) throw new Error("Business not found");
    const platforms2 = await getPlatformsByBusiness(biz.id);
    const staff2 = await getStaffByBusiness(biz.id);
    const trialExpired = isTrialExpired(biz.trialStartedAt);
    return {
      id: biz.id,
      name: biz.name,
      slug: biz.slug,
      businessType: biz.businessType,
      tagline: biz.tagline,
      keywords: JSON.parse(biz.keywords || "[]"),
      ownerPin: biz.ownerPin,
      planTier: biz.planTier,
      trialExpired,
      platforms: platforms2,
      staff: staff2
    };
  }),
  // ─── Owner: list my businesses ───────────────────────────────
  myBusinesses: protectedProcedure.query(async ({ ctx }) => {
    const businesses2 = await getBusinessesByOwner(ctx.user.id);
    return businesses2.map((b) => ({
      ...b,
      keywords: JSON.parse(b.keywords || "[]"),
      trialExpired: isTrialExpired(b.trialStartedAt)
    }));
  }),
  // ─── Owner: create business ──────────────────────────────────
  create: protectedProcedure.input(import_zod2.z.object({
    name: import_zod2.z.string().min(2),
    businessType: import_zod2.z.string().optional(),
    phone: import_zod2.z.string().optional(),
    email: import_zod2.z.string().optional(),
    tagline: import_zod2.z.string().optional(),
    keywords: import_zod2.z.array(import_zod2.z.string()).optional()
  })).mutation(async ({ input, ctx }) => {
    let slug = generateSlug(input.name);
    const existing = await getBusinessBySlug(slug);
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;
    const biz = await createBusiness({
      ownerId: ctx.user.id,
      name: input.name,
      slug,
      businessType: input.businessType,
      phone: input.phone,
      email: input.email,
      planTier: "trial"
    });
    return biz;
  }),
  // ─── Owner: update business settings ────────────────────────
  update: protectedProcedure.input(import_zod2.z.object({
    id: import_zod2.z.number(),
    name: import_zod2.z.string().min(2).optional(),
    businessType: import_zod2.z.string().optional(),
    phone: import_zod2.z.string().optional(),
    email: import_zod2.z.string().optional(),
    ownerPin: import_zod2.z.string().length(4).optional(),
    tagline: import_zod2.z.string().optional(),
    keywords: import_zod2.z.array(import_zod2.z.string()).optional()
  })).mutation(async ({ input, ctx }) => {
    const biz = await getBusinessById(input.id);
    if (!biz) throw new Error("Business not found");
    if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
    const { id, keywords, ...rest } = input;
    return updateBusiness(id, {
      ...rest,
      keywords: keywords ? JSON.stringify(keywords) : void 0
    });
  }),
  // ─── Owner: get platforms ────────────────────────────────────
  getPlatforms: protectedProcedure.input(import_zod2.z.object({ businessId: import_zod2.z.number() })).query(async ({ input, ctx }) => {
    const biz = await getBusinessById(input.businessId);
    if (!biz) throw new Error("Business not found");
    if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
    return getPlatformsByBusiness(input.businessId);
  }),
  // ─── Owner: update platform ──────────────────────────────────
  updatePlatform: protectedProcedure.input(import_zod2.z.object({
    businessId: import_zod2.z.number(),
    platformId: import_zod2.z.string(),
    url: import_zod2.z.string().optional(),
    reviewCount: import_zod2.z.number().optional(),
    targetCount: import_zod2.z.number().optional(),
    enabled: import_zod2.z.boolean().optional()
  })).mutation(async ({ input, ctx }) => {
    const biz = await getBusinessById(input.businessId);
    if (!biz) throw new Error("Business not found");
    if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
    const { businessId, platformId, ...data } = input;
    await upsertPlatform(businessId, platformId, data);
    return { success: true };
  }),
  // ─── Owner: staff management ─────────────────────────────────
  getStaff: protectedProcedure.input(import_zod2.z.object({ businessId: import_zod2.z.number() })).query(async ({ input, ctx }) => {
    const biz = await getBusinessById(input.businessId);
    if (!biz) throw new Error("Business not found");
    if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
    return getStaffByBusiness(input.businessId);
  }),
  recordStaffActivity: protectedProcedure.input(import_zod2.z.object({
    businessId: import_zod2.z.number(),
    name: import_zod2.z.string().min(1),
    shares: import_zod2.z.number().optional(),
    reviews: import_zod2.z.number().optional()
  })).mutation(async ({ input, ctx }) => {
    const biz = await getBusinessById(input.businessId);
    if (!biz) throw new Error("Business not found");
    if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
    return upsertStaffMember(input.businessId, input.name, {
      shares: input.shares,
      reviews: input.reviews
    });
  }),
  // ─── Owner: leads ────────────────────────────────────────────
  getLeads: protectedProcedure.input(import_zod2.z.object({ businessId: import_zod2.z.number() })).query(async ({ input, ctx }) => {
    const biz = await getBusinessById(input.businessId);
    if (!biz) throw new Error("Business not found");
    if (biz.ownerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("Not authorized");
    return getLeadsByBusiness(input.businessId);
  }),
  // ─── Public: submit lead ─────────────────────────────────────
  submitLead: publicProcedure.input(import_zod2.z.object({
    businessId: import_zod2.z.number().optional(),
    name: import_zod2.z.string().optional(),
    email: import_zod2.z.string().optional(),
    phone: import_zod2.z.string().optional(),
    businessName: import_zod2.z.string().optional(),
    website: import_zod2.z.string().optional(),
    source: import_zod2.z.string().optional(),
    smsConsent: import_zod2.z.boolean().optional(),
    marketingConsent: import_zod2.z.boolean().optional()
  })).mutation(async ({ input }) => {
    await createLead(input);
    return { success: true };
  }),
  // ─── Admin: all businesses ───────────────────────────────────
  adminGetAll: adminProcedure.query(async () => {
    const businesses2 = await getAllBusinesses();
    return businesses2.map((b) => ({
      ...b,
      keywords: JSON.parse(b.keywords || "[]"),
      trialExpired: isTrialExpired(b.trialStartedAt)
    }));
  }),
  // ─── Admin: set plan tier ────────────────────────────────────
  adminSetPlan: adminProcedure.input(import_zod2.z.object({
    businessId: import_zod2.z.number(),
    planTier: import_zod2.z.enum(["trial", "kit", "core", "pro"])
  })).mutation(async ({ input }) => {
    await updateBusiness(input.businessId, { planTier: input.planTier });
    return { success: true };
  }),
  // ─── Admin: delete business ──────────────────────────────────
  adminDelete: adminProcedure.input(import_zod2.z.object({ businessId: import_zod2.z.number() })).mutation(async ({ input }) => {
    await deleteBusinessById(input.businessId);
    return { success: true };
  }),
  // ─── Admin: create business for a client ────────────────────
  adminCreate: adminProcedure.input(import_zod2.z.object({
    ownerId: import_zod2.z.number(),
    name: import_zod2.z.string().min(2),
    businessType: import_zod2.z.string().optional(),
    phone: import_zod2.z.string().optional(),
    email: import_zod2.z.string().optional(),
    planTier: import_zod2.z.enum(["trial", "kit", "core", "pro"]).optional()
  })).mutation(async ({ input }) => {
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
    coreLink: env.STRIPE_CORE_LINK
  }))
});

// server/routers/adminRouter.ts
var import_zod3 = require("zod");
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
function generateSlug2(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 50);
}
var adminRouter = router({
  // ─── All businesses ──────────────────────────────────────────
  getAllBusinesses: adminProcedure.query(async () => {
    const businesses2 = await getAllBusinesses();
    return businesses2.map((b) => ({
      ...b,
      keywords: JSON.parse(b.keywords || "[]"),
      trialExpired: isTrialExpired(b.trialStartedAt)
    }));
  }),
  // ─── Update plan tier ────────────────────────────────────────
  updateBusinessPlan: adminProcedure.input(import_zod3.z.object({
    businessId: import_zod3.z.number(),
    planTier: import_zod3.z.enum(["trial", "kit", "core", "pro"])
  })).mutation(async ({ input }) => {
    await updateBusiness(input.businessId, { planTier: input.planTier });
    return { success: true };
  }),
  // ─── Extend trial ────────────────────────────────────────────
  extendTrial: adminProcedure.input(import_zod3.z.object({ businessId: import_zod3.z.number() })).mutation(async ({ input }) => {
    await updateBusiness(input.businessId, { trialStartedAt: /* @__PURE__ */ new Date() });
    return { success: true };
  }),
  // ─── Delete business ─────────────────────────────────────────
  deleteBusiness: adminProcedure.input(import_zod3.z.object({ businessId: import_zod3.z.number() })).mutation(async ({ input }) => {
    await deleteBusinessById(input.businessId);
    return { success: true };
  }),
  // ─── Create business + owner account ─────────────────────────
  createBusiness: adminProcedure.input(import_zod3.z.object({
    ownerName: import_zod3.z.string().min(2),
    ownerEmail: import_zod3.z.string().email(),
    ownerPassword: import_zod3.z.string().min(8),
    businessName: import_zod3.z.string().min(2),
    planTier: import_zod3.z.enum(["trial", "kit", "core", "pro"]).default("trial")
  })).mutation(async ({ input }) => {
    let user = await getUserByEmail(input.ownerEmail);
    if (!user) {
      const passwordHash = await import_bcryptjs2.default.hash(input.ownerPassword, 12);
      user = await createUser({ email: input.ownerEmail, passwordHash, name: input.ownerName });
    }
    if (!user) throw new Error("Failed to create user");
    let slug = generateSlug2(input.businessName);
    const existing = await getBusinessBySlug(slug);
    if (existing) slug = `${slug}-${Date.now().toString(36)}`;
    const biz = await createBusiness({
      ownerId: user.id,
      name: input.businessName,
      slug,
      planTier: input.planTier
    });
    return { user, business: biz };
  }),
  // ─── All leads ───────────────────────────────────────────────
  getAllLeads: adminProcedure.query(async () => {
    return getAllLeads();
  })
});

// server/routers.ts
var appRouter = router({
  auth: authRouter,
  business: businessRouter,
  admin: adminRouter
});

// api/trpc.ts
async function handler(req, res) {
  const url = `https://${req.headers.host || "localhost"}${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }
  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = JSON.stringify(req.body);
    headers.set("content-type", "application/json");
  }
  const request = new Request(url, {
    method: req.method,
    headers,
    body
  });
  const response = await (0, import_fetch.fetchRequestHandler)({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: async () => {
      const cookieHeader = req.headers.cookie || "";
      const expressLike = {
        headers: req.headers,
        body: req.body,
        method: req.method,
        url: req.url
      };
      const responseLike = {
        setHeader: (k, v) => res.setHeader(k, v),
        getHeader: (k) => res.getHeader(k)
      };
      return createContext({ req: expressLike, res: responseLike });
    }
  });
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    res.setHeader("set-cookie", setCookie);
  }
  res.status(response.status);
  const text2 = await response.text();
  res.send(text2);
}
