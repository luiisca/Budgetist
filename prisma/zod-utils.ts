import { z } from "zod";

// helpers
const nonEmptyString = z.string().min(1, { message: "Cannot be empty" });

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
const range = (init: number, end: number) => z.number().min(init).max(end);

export const username = z
  .string()
  .min(2, { message: "Must be at least 2 characters long" })
  .optional();

const percentage = z
  .number()
  .positive()
  .max(100, { message: "Cannot be greater than 100%" });

export const selectOptions = z.object({
  value: z.string().optional(),
  label: z.string().optional(),
});

// profile
export const profileData = z.object({
  username,
  name: z.string().optional(),
  avatar: z.string().optional(),
  country: z.string().optional(),
  inflation: z.string().or(z.number().positive()).optional(),
  currency: z.string().optional(),
  investPerc: z.string().or(percentage).optional(),
  indexReturn: z.string().or(z.number().positive()).optional(),
  completedOnboarding: z.boolean().optional(),
});

// salary
export const salaryDataClient = z.object({
  title: z.string().optional(),
  currency: selectOptions,
  amount: z.number().positive(),
  taxType: selectOptions,
  taxPercent: nonEmptyString.or(range(0, 100)),
  variance: z
    .array(
      z
        .object({
          from: nonEmptyString.or(z.number().positive()),
          amount: nonEmptyString.or(z.number().positive()),
          taxPercent: z.string().or(percentage).optional(),
        })
        .required()
    )
    .optional(),
});
export const salaryDataServer = salaryDataClient.extend({
  id: z.number().positive().optional(),
  currency: z.string().optional(),
  taxType: z.union([equalTo("perCat"), equalTo("perRec")]),
  taxPercent: range(0, 100),
  variance: z
    .array(
      z
        .object({
          from: z.number().positive(),
          amount: z.number().positive(),
          taxPercent: percentage,
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
  currency: selectOptions,
  type: selectOptions,
  inflType: selectOptions,
  country: selectOptions,
  inflVal: nonEmptyString.or(z.number().positive()).optional(), // pass default
  icon: z.string().optional(), // pass random default

  records: z
    .array(
      z
        .object({
          title: z.string().optional(),
          amount: nonEmptyString.or(z.number().positive()),
          frequency: nonEmptyString.or(z.number().positive()).optional(), // pass default // must be between 1 & 12
          inflType: z.boolean(),
          inflation: z.string().or(z.number().positive()).optional(), // parent default
          type: selectOptions,
          country: selectOptions,
          currency: selectOptions.optional(),
        })
        .required()
    )
    .optional(),
  freqType: selectOptions,
  frequency: z.union([nonEmptyString, z.number().positive()]).optional(), // pass default
});
export const categoryDataServer = categoryDataClient.extend({
  id: z.number().positive().optional(),
  budget: z.number().positive(),
  currency: z.union([equalTo("perRec"), z.string().optional()]), // pass default
  type: z.union([equalTo("income"), equalTo("outcome")]),
  inflType: z.union([equalTo(""), equalTo("perCat"), equalTo("perRec")]),
  country: z.string(),
  inflVal: z.number().positive(),
  icon: z.string(),

  records: z
    .array(
      z
        .object({
          title: z.string().optional(),
          amount: z.number().positive(),
          frequency: z.number().positive(),
          inflType: z.boolean(),
          inflation: z.number().positive(),
          type: z.union([equalTo("income"), equalTo("outcome")]),
          country: z.string(),
          currency: z.string(),
        })
        .required()
    )
    .optional(),
  freqType: z.union([equalTo("perRec"), equalTo("perCat")]),
  frequency: z.number().positive(),
});

// run simulation
export const runSimulationData = z.object({
  years: nonEmptyString.or(z.number().positive()),
});

export type ProfileDataInputType = z.infer<typeof profileData>;

export type SalaryDataInputTypeClient = z.infer<typeof salaryDataClient>;
export type SalaryDataInputTypeServer = z.infer<typeof salaryDataServer>;

export type CategoryDataInputTypeClient = z.infer<typeof categoryDataClient>;
export type CategoryDataInputTypeServer = z.infer<typeof categoryDataServer>;

export type RunSimulationDataType = z.infer<typeof runSimulationData>;
