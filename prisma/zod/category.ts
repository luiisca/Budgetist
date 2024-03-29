import * as z from "zod"
import * as imports from "../zod-utils"
import { CompleteUser, UserModel, CompleteRecord, RecordModel } from "./index"

export const _CategoryModel = z.object({
  id: z.number().int(),
  title: z.string(),
  budget: z.number().int(),
  currency: z.string(),
  type: z.string(),
  inflType: z.string(),
  country: z.string(),
  inflVal: z.number().int(),
  icon: z.string(),
  freqType: z.string(),
  frequency: z.number().int(),
  userId: z.number().int(),
})

export interface CompleteCategory extends z.infer<typeof _CategoryModel> {
  user: CompleteUser
  records: CompleteRecord[]
}

/**
 * CategoryModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const CategoryModel: z.ZodSchema<CompleteCategory> = z.lazy(() => _CategoryModel.extend({
  user: UserModel,
  records: RecordModel.array(),
}))
