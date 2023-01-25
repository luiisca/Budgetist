import * as z from "zod"
import * as imports from "../zod-utils"
import { CompleteCategory, CategoryModel } from "./index"

export const _RecordModel = z.object({
  id: z.number().int(),
  title: z.string().nullish(),
  amount: z.number().int(),
  type: z.string(),
  frequency: z.number().int(),
  inflType: z.boolean(),
  country: z.string(),
  inflation: z.number().int(),
  currency: z.string(),
  categoryId: z.number().int(),
})

export interface CompleteRecord extends z.infer<typeof _RecordModel> {
  category: CompleteCategory
}

/**
 * RecordModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RecordModel: z.ZodSchema<CompleteRecord> = z.lazy(() => _RecordModel.extend({
  category: CategoryModel,
}))
