import * as z from "zod"
import * as imports from "../zod-utils"
import { CompletePeriod, RelatedPeriodModel, CompleteUser, RelatedUserModel } from "./index"

export const SalaryModel = z.object({
  id: z.bigint(),
  title: z.string(),
  currency: z.string(),
  amount: z.number().int(),
  taxType: z.string(),
  taxPercent: z.number().int(),
  userId: z.string(),
})

export interface CompleteSalary extends z.infer<typeof SalaryModel> {
  variance: CompletePeriod[]
  user: CompleteUser
}

/**
 * RelatedSalaryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedSalaryModel: z.ZodSchema<CompleteSalary> = z.lazy(() => SalaryModel.extend({
  variance: RelatedPeriodModel.array(),
  user: RelatedUserModel,
}))
