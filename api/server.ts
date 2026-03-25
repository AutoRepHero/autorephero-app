import type { VercelRequest, VercelResponse } from "@vercel/node";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/trpc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ─── tRPC API ──────────────────────────────────────────────
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as any, res as any);
}
