/* ============================================================
   AutoRepHero — Vercel Serverless Function for tRPC
   Handles all /api/trpc/* requests
   ============================================================ */
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import { appRouter } from "../server/routers";
import { createContext } from "../server/trpc";

const app = express();

app.use(express.json());

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
