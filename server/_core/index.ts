import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import Stripe from "stripe";
import { notifyOwner } from "./notification";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ⚠️ Stripe webhook MUST be registered before express.json() to preserve raw body
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig!,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[Webhook] Signature verification failed:", message);
        res.status(400).send(`Webhook Error: ${message}`);
        return;
      }

      // Test event passthrough — required for Stripe webhook verification
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        res.json({ verified: true });
        return;
      }

      console.log(`[Webhook] Event received: ${event.type} | ${event.id}`);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const productId = session.metadata?.product_id ?? "unknown";
          const customerEmail = session.metadata?.customer_email ?? session.customer_email ?? "unknown";
          const customerName = session.metadata?.customer_name ?? "";
          console.log(`[Webhook] Purchase complete — product: ${productId}, customer: ${customerEmail}`);
          await notifyOwner({
            title: `New AutoRepHero Purchase: ${productId}`,
            content: `Customer: ${customerName} (${customerEmail})\nProduct: ${productId}\nSession: ${session.id}`,
          }).catch(console.error);
          break;
        }
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          console.log(`[Webhook] Subscription cancelled: ${sub.id}`);
          break;
        }
        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    }
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
