import * as z from "zod"
import * as imports from "../zod-utils"
import { IdentityProvider } from "@prisma/client"
import { CompleteAccount, AccountModel, CompleteSession, SessionModel, CompleteSalary, SalaryModel } from "./index"

export const _UserModel = z.object({
  id: z.number().int(),
  username: imports.username.nullish(),
  name: z.string().nullish(),
  email: z.string(),
  emailVerified: z.date().nullish(),
  avatar: z.string().nullish(),
  identityProvider: z.nativeEnum(IdentityProvider),
  identityProviderId: z.string().nullish(),
  completedOnboarding: z.boolean(),
  country: z.string(),
  inflation: z.number().int(),
  currency: z.string(),
  investPerc: z.number().int(),
  indexReturn: z.number().int(),
})

export interface CompleteUser extends z.infer<typeof _UserModel> {
  accounts: CompleteAccount[]
  sessions: CompleteSession[]
  salary?: CompleteSalary | null
}

/**
 * UserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const UserModel: z.ZodSchema<CompleteUser> = z.lazy(() => _UserModel.extend({
  accounts: AccountModel.array(),
  sessions: SessionModel.array(),
  salary: SalaryModel.nullish(),
}))
