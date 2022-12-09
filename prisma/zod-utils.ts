import { z } from "zod";

export const nonEmptyString = z.string().min(1, { message: "Cannot be empty" });
const equalTo = (value: string) => {
  return z
    .string()
    .startsWith(value, {
      message: `Must be equal to ${value}`,
    })
    .endsWith(value, {
      message: `Must be equal to ${value}`,
    });
};

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

// salary
export const salaryDataClient = z.object({
  title: z.string().optional(),
  currency: z.string().optional(),
  amount: z.number().positive(),
  variance: z
    .array(
      z
        .object({
          from: nonEmptyString.or(z.number().positive()),
          amount: nonEmptyString.or(z.number().positive()),
        })
        .required()
    )
    .optional(),
});
export const salaryDataServer = salaryDataClient.extend({
  variance: z
    .array(
      z
        .object({
          from: z.number().positive(),
          amount: z.number().positive(),
        })
        .required()
    )
    .optional(),
});

// categories
export const categoryDataClient = z.object({
  id: z.number().optional(),
  title: nonEmptyString,
  budget: nonEmptyString.or(z.number().positive()),
  currency: z.union([equalTo("perRec"), z.string().optional()]), // pass default
  type: z.union([equalTo("income"), equalTo("outcome")]),
  inflType: z.union([equalTo(""), equalTo("perCat"), equalTo("perRec")]),
  country: z.string().optional(), // pass default
  inflVal: nonEmptyString.or(z.number().positive()).optional(), // pass default
  icon: z.string().optional(), // pass random default

  records: z
    .array(
      z
        .object({
          title: z.string().optional(),
          amount: nonEmptyString.or(z.number().positive()),
          type: z.union([equalTo("income"), equalTo("outcome")]),
          frequency: nonEmptyString.or(z.number().positive()).optional(), // pass default // must be between 1 & 12
          inflType: z.boolean(),
          country: z.string().optional(), // pass default
          inflation: nonEmptyString.or(z.number().positive()).optional(), // parent default
          currency: z.string().optional(), // pass default
        })
        .required()
    )
    .optional(),
  freqType: z.union([equalTo("perRec"), equalTo("perCat")]).optional(),
  frequency: z.union([nonEmptyString, z.number().positive()]).optional(), // pass default
});

export const categoryDataServer = categoryDataClient.extend({
  id: z.number().optional(),
  country: z.string(),
  budget: z.number().positive(),
  inflType: z.union([equalTo(""), equalTo("perCat"), equalTo("perRec")]),
  inflVal: z.number().positive(),
  icon: z.string(),

  records: z
    .array(
      z
        .object({
          title: z.string().optional(),
          amount: z.number().positive(),
          type: z.union([equalTo("income"), equalTo("outcome")]),
          frequency: z.number().positive(),
          inflType: z.boolean(),
          country: z.string(),
          inflation: z.number().positive(),
          currency: z.string(),
        })
        .required()
    )
    .optional(),
  freqType: z.union([equalTo("perRec"), equalTo("perCat")]),
  frequency: z.number().positive(),
});

export type ProfileDataInputType = z.infer<typeof profileData>;

export type SalaryDataInputTypeClient = z.infer<typeof salaryDataClient>;
export type SalaryDataInputTypeServer = z.infer<typeof salaryDataServer>;

export type CategoryDataInputTypeClient = z.infer<typeof categoryDataClient>;
export type CategoryDataInputTypeServer = z.infer<typeof categoryDataServer>;
