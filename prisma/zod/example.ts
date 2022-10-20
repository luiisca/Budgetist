import * as z from "zod"
import * as imports from "../zod-utils"

export const _ExampleModel = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
