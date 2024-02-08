import * as z from "zod"
import * as imports from "../zod-utils"
import { CompleteSalary, RelatedSalaryModel } from "./index"

export const PeriodModel = z.object({
  id: z.bigint(),
  from: z.number().int(),
  amount: z.number().int(),
  salaryId: z.bigint(),
  taxPercent: z.number().int(),
})

export interface CompletePeriod extends z.infer<typeof PeriodModel> {
  salary: CompleteSalary
}

/**
 * RelatedPeriodModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedPeriodModel: z.ZodSchema<CompletePeriod> = z.lazy(() => PeriodModel.extend({
  salary: RelatedSalaryModel,
}))
