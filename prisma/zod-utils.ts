import { z } from "zod";

export const username = z
  .string()
  .min(2, { message: "Must be at least 2 characters long" })
  .optional();

export const investPerc = z
  .number()
  .positive()
  .max(100, { message: "Cannot be greater than 100%" })
  .optional();

export const profileData = z.object({
  username,
  name: z.string().optional(),
  avatar: z.string().optional(),
  country: z.string().optional(),
  inflation: z.number().positive().optional(),
  currency: z.string().optional(),
  investPerc,
  indexReturn: z.number().positive().optional(),
  completedOnboarding: z.boolean().optional(),
});

export type ProfileDataInputType = z.infer<typeof profileData>;
