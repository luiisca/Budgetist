import * as z from "zod"
import * as imports from "../zod-utils"
import { CompleteSalary, SalaryModel } from "./index"

export const _PeriodModel = z.object({
  id: z.number().int(),
  from: z.number().int(),
  amount: z.number().int(),
  salaryId: z.number().int(),
})

export interface CompletePeriod extends z.infer<typeof _PeriodModel> {
  salary: CompleteSalary
}

/**
 * PeriodModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const PeriodModel: z.ZodSchema<CompletePeriod> = z.lazy(() => _PeriodModel.extend({
  salary: SalaryModel,
}))
