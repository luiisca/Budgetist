import * as z from "zod"
import * as imports from "../zod-utils"

export const VerificationTokenModel = z.object({
  identifier: z.string(),
  token: z.string(),
  expires: z.date(),
})
