import { z } from "zod";
import bcrypt from "bcryptjs";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { getUserByEmail, createUser } from "../db";
import { signToken } from "../auth";
import { env } from "../env";

export const authRouter = router({
  // ─── Sign up ────────────────────────────────────────────────
  signup: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await getUserByEmail(input.email);
      if (existing) throw new Error("An account with that email already exists");

      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await createUser({ email: input.email, passwordHash, name: input.name });
      if (!user) throw new Error("Failed to create account");

      const token = await signToken({ userId: user.id, email: user.email, role: user.role });
      ctx.res.setHeader("Set-Cookie", `arh_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`);

      return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    }),

  // ─── Login ──────────────────────────────────────────────────
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await getUserByEmail(input.email);
      if (!user) throw new Error("Invalid email or password");

      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) throw new Error("Invalid email or password");

      const token = await signToken({ userId: user.id, email: user.email, role: user.role });
      ctx.res.setHeader("Set-Cookie", `arh_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}`);

      return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    }),

  // ─── Logout ─────────────────────────────────────────────────
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.setHeader("Set-Cookie", "arh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
    return { success: true };
  }),

  // ─── Me ─────────────────────────────────────────────────────
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) return null;
    return { id: ctx.user.id, email: ctx.user.email, name: ctx.user.name, role: ctx.user.role };
  }),
});
