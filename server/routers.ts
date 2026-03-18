import { router } from "./trpc";
import { authRouter } from "./routers/authRouter";
import { businessRouter } from "./routers/businessRouter";
import { adminRouter } from "./routers/adminRouter";

export const appRouter = router({
  auth: authRouter,
  business: businessRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
