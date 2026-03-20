import {
  serial,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const planTierEnum = pgEnum("plan_tier", ["trial", "kit", "core", "pro"]);

// ─── Users (business owners — email/password auth) ────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: text("name"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Businesses (one per client) ─────────────────────────────
export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(), // FK → users.id
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-safe identifier
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

// ─── Platforms (per business) ─────────────────────────────────
export const platforms = pgTable("platforms", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(), // FK → businesses.id
  platformId: varchar("platform_id", { length: 50 }).notNull(), // e.g. "google", "yelp"
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

// ─── Staff (per business) ─────────────────────────────────────
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(), // FK → businesses.id
  name: varchar("name", { length: 100 }).notNull(),
  shares: integer("shares").notNull().default(0),
  reviews: integer("reviews").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Leads (per business) ─────────────────────────────────────
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id"), // nullable — global leads from landing page
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
