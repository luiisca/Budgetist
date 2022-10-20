import * as z from "zod"
import * as imports from "../zod-utils"
import { IdentityProvider } from "@prisma/client"
import { CompleteAccount, AccountModel, CompleteSession, SessionModel } from "./index"

export const _UserModel = z.object({
  id: z.string(),
  username: imports.username.nullish(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  emailVerified: z.date().nullish(),
  identityProvider: z.nativeEnum(IdentityProvider),
  identityProviderId: z.string().nullish(),
  image: z.string().nullish(),
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
  accounts: CompleteAccount[]
  sessions: CompleteSession[]
}

/**
 * UserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserModel: z.ZodSchema<CompleteUser> = z.lazy(() => _UserModel.extend({
  accounts: AccountModel.array(),
  sessions: SessionModel.array(),
}))
