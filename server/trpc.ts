import { initTRPC, TRPCError } from "@trpc/server";
import type { Request, Response } from "express";
import superjson from "superjson";
import { verifyToken, parseCookies } from "./auth";
import { getUserById } from "./db";

// ─── Context ──────────────────────────────────────────────────
export async function createContext({ req, res }: { req: Request; res: Response }) {
  let user: Awaited<ReturnType<typeof getUserById>> | null = null;
  const cookieHeader = req.headers.cookie || "";
  const cookies = parseCookies(cookieHeader);
  const token = cookies["arh_token"];
  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      user = await getUserById(payload.userId);
    }
  }
  return { req, res, user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

// ─── tRPC init ────────────────────────────────────────────────
const t = initTRPC.context<Context>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in" });
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});
