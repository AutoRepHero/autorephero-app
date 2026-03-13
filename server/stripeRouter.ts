import Stripe from "stripe";
import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { PRODUCTS, type ProductId } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const stripeRouter = router({
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        productId: z.enum([
          "boots_on_the_ground",
          "nfc_starter_pack",
          "asset_starter_pack",
        ]),
        origin: z.string().url(),
        customerEmail: z.string().email().optional(),
        customerName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const product = PRODUCTS[input.productId as ProductId];

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: product.mode,
        allow_promotion_codes: true,
        customer_email: input.customerEmail,
        success_url: `${input.origin}/success?session_id={CHECKOUT_SESSION_ID}&product=${input.productId}`,
        cancel_url: `${input.origin}/landing#pricing`,
        metadata: {
          product_id: product.id,
          customer_email: input.customerEmail ?? "",
          customer_name: input.customerName ?? "",
        },
        line_items: [
          {
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: product.amount,
              ...(product.mode === "subscription" && product.interval
                ? { recurring: { interval: product.interval } }
                : {}),
            },
            quantity: 1,
          },
        ],
      };

      const session = await stripe.checkout.sessions.create(sessionParams);
      return { url: session.url };
    }),
});
