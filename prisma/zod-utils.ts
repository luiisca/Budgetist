import { z } from "zod";

export const username = z
  .string()
  .min(2, { message: "Must be at least 2 characters long" })
  .optional();

export const investPerc = z
  .string()
  .or(
    z.number().positive().max(100, { message: "Cannot be greater than 100%" })
  )
  .optional();

export const profileData = z.object({
  username,
  name: z.string().optional(),
  avatar: z.string().optional(),
  country: z.string().optional(),
  inflation: z.string().or(z.number().positive()).optional(),
  currency: z.string().optional(),
  investPerc,
  indexReturn: z.string().or(z.number().positive()).optional(),
  completedOnboarding: z.boolean().optional(),
});
export const salaryVarianceStringOrNumber = z
  .array(
    z
      .object({
        from: z
          .string()
          .min(1, { message: "Cannot be empty" })
          .or(z.number().positive()),
        amount: z
          .string()
          .min(1, { message: "Cannot be empty" })
          .or(z.number().positive()),
      })
      .required()
  )
  .optional();

export const salaryVarianceNumber = z
  .array(
    z
      .object({
        from: z.number().positive(),
        amount: z.number().positive(),
      })
      .required()
  )
  .optional();

export const salaryData = z.object({
  title: z.string().optional(),
  currency: z.string().optional(),
  amount: z.number().positive(),
  variance: salaryVarianceStringOrNumber,
});
export const salaryDataVarianceNumber = salaryData.extend({
  variance: salaryVarianceNumber,
});

export type ProfileDataInputType = z.infer<typeof profileData>;
export type SalaryDataInputType = z.infer<typeof salaryData>;
export type SalaryDataInputTypeVarianceNumber = z.infer<
  typeof salaryDataVarianceNumber
>;
