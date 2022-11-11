import { z } from "zod";

export const username = z
  .string()
  .min(2, { message: "min_length_2" })
  .optional();

export const profileData = z.object({
  username: z.string().min(2, { message: "min_length_2" }).optional(),
  name: z.string().min(5, { message: "min_length_5" }),
  email: z.string().email().optional(),
  avatar: z.string().optional(),
  country: z.string(),
  inflation: z.number(),
  currency: z.string(),
  investPerc: z.number(),
  indexReturn: z.number(),
});

export type ProfileDataInputType = z.infer<typeof profileData>;
