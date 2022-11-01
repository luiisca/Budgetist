import { IdentityProvider } from "@prisma/client";
import type { NextApiRequest } from "next";
import type { Session } from "next-auth";
import {
  getSession as getSessionInner,
  GetSessionParams,
} from "next-auth/react";

import { HttpError } from "utils/http-error";

export async function getSession(
  options: GetSessionParams
): Promise<Session | null> {
  const session = await getSessionInner(options);

  // that these are equal are ensured in `[...nextauth]`'s callback
  return session as Session | null;
}

type CtxOrReq =
  | { req: NextApiRequest; ctx?: never }
  | { ctx: { req: NextApiRequest }; req?: never };

export const ensureSession = async (ctxOrReq: CtxOrReq) => {
  const session = await getSession(ctxOrReq);
  if (!session?.user?.id)
    throw new HttpError({ statusCode: 401, message: "Unauthorized" });
  return session;
};

export enum ErrorCode {
  UserNotFound = "user-not-found",
  InternalServerError = "internal-server-error",
  ThirdPartyIdentityProviderEnabled = "third-party-identity-provider-enabled",
  IncorrectProvider = "IncorrectProvider",
  RateLimitExceeded = "rate-limit-exceeded",
}

export const identityProviderNameMap: { [key in IdentityProvider]: string } = {
  [IdentityProvider.MAGIC]: "Magic",
  [IdentityProvider.GOOGLE]: "Google",
  [IdentityProvider.GITHUB]: "Github",
};
