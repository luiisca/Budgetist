// src/server/router/context.ts
import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { Session } from "next-auth";
import { getServerAuthSession } from "../common/get-server-auth-session";
import { prisma } from "../db/client";
import { Maybe } from "@trpc/server";
import { defaultAvatarSrc } from "utils/profile";

type CreateContextOptions = {
  session: Session | null;
};

async function getUserFromSession({ session }: { session: Maybe<Session> }) {
  if (!session?.user?.id) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      emailVerified: true,
      avatar: true,
      identityProvider: true,
      completedOnboarding: true,
      country: true,
      inflation: true,
      currency: true,
      investPerc: true,
      indexReturn: true,
    },
  });

  // some hacks to make sure `username` and `email` are never inferred as `null`
  if (!user) {
    return null;
  }
  const { email, username } = user;
  if (!email) {
    return null;
  }
  const avatar = user.avatar || defaultAvatarSrc({ email });

  return {
    ...user,
    avatar,
    email,
    username,
  };
}
/** Use this helper for:
 * - testing, so we dont have to mock Next.js' req/res
 * - trpc's `createSSGHelpers` where we don't have req/res
 **/
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  };
};

/**
 * Outer context. Used in the routers and will e.g. bring `req` & `res` to the context as "not `undefined`".
 *
 * @see https://trpc.io/docs/context#inner-and-outer-context
 */
export const createContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the unstable_getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });
  const contextInner = await createContextInner({ session });
  const user = await getUserFromSession({ session });

  return {
    ...contextInner,
    prisma,
    user,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
