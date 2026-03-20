/* ============================================================
   AutoRepHero — Vercel Serverless Function for tRPC
   Handles all /api/trpc/* requests
   ============================================================ */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/trpc";

const app = express();
app.use(express.json());
app.use(
  "/",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Strip the /api/trpc prefix so tRPC sees the procedure path only
  req.url = req.url?.replace(/^\/api\/trpc/, "") || "/";
  return app(req as any, res as any);
}
