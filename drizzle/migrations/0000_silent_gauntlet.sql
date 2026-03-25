CREATE TYPE "public"."plan_tier" AS ENUM('trial', 'kit', 'core', 'pro');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "arh_businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"business_type" varchar(100),
	"phone" varchar(30),
	"email" varchar(320),
	"owner_pin" varchar(10) DEFAULT '1234' NOT NULL,
	"tagline" text,
	"keywords" varchar(1000) DEFAULT '[]',
	"plan_tier" "plan_tier" DEFAULT 'trial' NOT NULL,
	"trial_started_at" timestamp DEFAULT now() NOT NULL,
	"stripe_customer_id" varchar(100),
	"stripe_subscription_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "arh_businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "arh_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer,
	"name" varchar(100),
	"email" varchar(320),
	"phone" varchar(30),
	"business_name" varchar(255),
	"website" varchar(255),
	"source" varchar(50) DEFAULT 'landing',
	"sms_consent" boolean DEFAULT false,
	"marketing_consent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arh_platforms" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"platform_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"short_name" varchar(50),
	"icon" varchar(10),
	"color" varchar(20),
	"url" text,
	"review_count" integer DEFAULT 0 NOT NULL,
	"target_count" integer DEFAULT 20 NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arh_staff" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"shares" integer DEFAULT 0 NOT NULL,
	"reviews" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "arh_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" text,
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "arh_users_email_unique" UNIQUE("email")
);
