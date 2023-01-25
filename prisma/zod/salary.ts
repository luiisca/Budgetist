import * as z from "zod"
import * as imports from "../zod-utils"
import { CompletePeriod, PeriodModel, CompleteUser, UserModel } from "./index"

export const _SalaryModel = z.object({
  id: z.number().int(),
  title: z.string(),
  currency: z.string(),
  amount: z.number().int(),
  taxType: z.string(),
  taxPercent: z.number().int(),
  userId: z.number().int(),
})

export interface CompleteSalary extends z.infer<typeof _SalaryModel> {
  variance: CompletePeriod[]
  user: CompleteUser
}

/**
 * SalaryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const SalaryModel: z.ZodSchema<CompleteSalary> = z.lazy(() => _SalaryModel.extend({
  variance: PeriodModel.array(),
  user: UserModel,
}))
