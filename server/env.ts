import dotenv from "dotenv";
dotenv.config();

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET || "arh-dev-secret-change-in-prod",
  NODE_ENV: process.env.NODE_ENV || "development",
  OWNER_EMAIL: process.env.OWNER_EMAIL || "chuck@autorephero.com",
  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_KIT_LINK: "https://pay.chuckzonline.com/b/eVq28jfRU3tl57VdBu63K01",
  STRIPE_CORE_LINK: "https://pay.chuckzonline.com/b/4gMeV5eNQ5Bt0RF1SM63K02",
};
