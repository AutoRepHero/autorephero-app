import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users (business owners — email/password auth) ────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Businesses (one per client) ─────────────────────────────
export const businesses = mysqlTable("businesses", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull(), // FK → users.id
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(), // URL-safe identifier
  businessType: varchar("businessType", { length: 100 }),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  ownerPin: varchar("ownerPin", { length: 10 }).notNull().default("1234"),
  tagline: text("tagline"),
  keywords: varchar("keywords", { length: 1000 }).default("[]"),
  planTier: mysqlEnum("planTier", ["trial", "kit", "core", "pro"]).notNull().default("trial"),
  trialStartedAt: timestamp("trialStartedAt").defaultNow().notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 100 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Platforms (per business) ─────────────────────────────────
export const platforms = mysqlTable("platforms", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(), // FK → businesses.id
  platformId: varchar("platformId", { length: 50 }).notNull(), // e.g. "google", "yelp"
  name: varchar("name", { length: 100 }).notNull(),
  shortName: varchar("shortName", { length: 50 }),
  icon: varchar("icon", { length: 10 }),
  color: varchar("color", { length: 20 }),
  url: text("url"),
  reviewCount: int("reviewCount").notNull().default(0),
  targetCount: int("targetCount").notNull().default(20),
  enabled: boolean("enabled").notNull().default(false),
  sortOrder: int("sortOrder").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Staff (per business) ─────────────────────────────────────
export const staff = mysqlTable("staff", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(), // FK → businesses.id
  name: varchar("name", { length: 100 }).notNull(),
  shares: int("shares").notNull().default(0),
  reviews: int("reviews").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Leads (per business) ─────────────────────────────────────
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId"), // nullable — global leads from landing page
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  businessName: varchar("businessName", { length: 255 }),
  website: varchar("website", { length: 255 }),
  source: varchar("source", { length: 50 }).default("landing"),
  smsConsent: boolean("smsConsent").default(false),
  marketingConsent: boolean("marketingConsent").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
