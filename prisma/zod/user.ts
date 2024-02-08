import * as z from "zod"
import * as imports from "../zod-utils"
import { CompleteAccount, RelatedAccountModel, CompleteSession, RelatedSessionModel, CompleteFeedback, RelatedFeedbackModel, CompleteSalary, RelatedSalaryModel, CompleteCategory, RelatedCategoryModel } from "./index"

export const UserModel = z.object({
  id: z.string(),
  username: imports.username.nullish(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  emailVerified: z.date().nullish(),
  avatar: z.string().nullish(),
  completedOnboarding: z.boolean(),
  country: z.string(),
  inflation: z.number().int(),
  currency: z.string(),
  investPerc: z.number().int(),
  indexReturn: z.number().int(),
})

export interface CompleteUser extends z.infer<typeof UserModel> {
  accounts: CompleteAccount[]
  sessions: CompleteSession[]
  Feedback: CompleteFeedback[]
  salary: CompleteSalary[]
  categories: CompleteCategory[]
}

/**
 * RelatedUserModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedUserModel: z.ZodSchema<CompleteUser> = z.lazy(() => UserModel.extend({
  accounts: RelatedAccountModel.array(),
  sessions: RelatedSessionModel.array(),
  Feedback: RelatedFeedbackModel.array(),
  salary: RelatedSalaryModel.array(),
  categories: RelatedCategoryModel.array(),
}))
