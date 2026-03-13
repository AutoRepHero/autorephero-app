/**
 * AutoRepHero — Stripe Product & Price Definitions
 * All prices in cents (USD).
 * These are used to create Checkout Sessions server-side.
 */

export type ProductId = "boots_on_the_ground" | "nfc_starter_pack" | "asset_starter_pack";

export interface Product {
  id: ProductId;
  name: string;
  description: string;
  amount: number; // cents
  currency: string;
  mode: "subscription" | "payment";
  /** Stripe recurring interval — only used when mode === "subscription" */
  interval?: "month" | "year";
}

export const PRODUCTS: Record<ProductId, Product> = {
  boots_on_the_ground: {
    id: "boots_on_the_ground",
    name: "Boots on the Ground — Starter",
    description:
      "Review Hub PWA (NFC + QR + link), smart platform routing, AI review prompt generator, up to 5 review platforms, QR code generator, and 14-day free trial.",
    amount: 4700, // $47.00
    currency: "usd",
    mode: "subscription",
    interval: "month",
  },
  nfc_starter_pack: {
    id: "nfc_starter_pack",
    name: "NFC Starter Pack",
    description:
      "10 branded NFC cards pre-programmed to your Review Hub URL, NFC setup guide, and card programming support.",
    amount: 9700, // $97.00
    currency: "usd",
    mode: "payment",
  },
  asset_starter_pack: {
    id: "asset_starter_pack",
    name: "Asset Starter Pack",
    description:
      "Printed QR code counter card, window sticker, table tent, and digital QR assets — all branded to your business.",
    amount: 19700, // $197.00
    currency: "usd",
    mode: "payment",
  },
};
