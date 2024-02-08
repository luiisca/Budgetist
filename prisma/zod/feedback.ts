import * as z from "zod"
import * as imports from "../zod-utils"
import { CompleteUser, RelatedUserModel } from "./index"

export const FeedbackModel = z.object({
  id: z.bigint(),
  date: z.date(),
  rating: z.string(),
  comment: z.string().nullish(),
  userId: z.string(),
})

export interface CompleteFeedback extends z.infer<typeof FeedbackModel> {
  user: CompleteUser
}

/**
 * RelatedFeedbackModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const RelatedFeedbackModel: z.ZodSchema<CompleteFeedback> = z.lazy(() => FeedbackModel.extend({
  user: RelatedUserModel,
}))
