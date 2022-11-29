// src/server/trpc/router/_app.ts
import { router } from "../trpc";
import { authRouter } from "./auth";
import { externalRouter } from "./external";
import { simulationRouter } from "./simulation";
import { userRouter } from "./user";

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  simulation: simulationRouter,
  external: externalRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
