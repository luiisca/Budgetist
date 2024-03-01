import { z } from "zod";

// helpers
const nonEmptyString = z.string().min(1, { message: "Cannot be empty" });
const numberInput = z.number({ invalid_type_error: "Cannot be empty" }).positive() // we're assuming input is only not a number when set to "", useful for <NumberInput />
const yearFrequency = numberInput.min(1).max(12)

const range = (init: number, end: number) => numberInput.min(init).max(end);

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
    image: z.string().optional(),
    country: z.string().optional(),
    inflation: z.string().or(z.number().positive()).optional(),
    currency: z.string().optional(),
    investPerc: z.string().or(percentage).optional(),
    indexReturn: z.string().or(z.number().positive()).optional(),
    completedOnboarding: z.boolean().optional(),
});

// salary
const optSalVarianceData = z.object({
    taxPercent: z.string().or(percentage).optional(),
})
const optSalData = z.object({
    id: z.bigint().positive().optional(),
    title: z.string().optional(),
    variance: z
        .array(
            optSalVarianceData.extend({
                from: nonEmptyString.or(z.number().positive()),
                amount: nonEmptyString.or(z.number().positive()),
            }).required()
        )
        .optional(),
})
export const salData = optSalData.extend({
    currency: selectOptions,
    amount: numberInput,
    taxType: selectOptions,
    taxPercent: range(0, 100),
});

// categories
const optCatData = z.object({
    id: z.bigint().optional(),
    inflVal: numberInput.optional(),
    icon: z.string().optional(),
    frequency: yearFrequency.optional(),
})
const optCatRecordData = z.object({
    title: z.string().optional(),
    frequency: yearFrequency.optional(),
    inflation: numberInput.optional(),
    currency: selectOptions.optional(),
})
export const catData = optCatData.extend({
    title: nonEmptyString,
    budget: numberInput,
    currency: selectOptions,
    type: selectOptions,
    inflType: selectOptions,
    country: selectOptions,

    records: z
        .array(
            optCatRecordData.extend({
                amount: numberInput,
                inflType: z.boolean(),
                type: selectOptions,
                country: selectOptions,
            }).required()
        )
        .optional(),
    freqType: selectOptions,
});

// run simulation
export const runSimulationData = z.object({
    years: nonEmptyString.or(z.number().positive()),
});

export type ProfileDataInputType = z.infer<typeof profileData>;
export type SalInputDataType = z.infer<typeof salData>;
export type CatInputDataType = z.infer<typeof catData>;
export type RunSimulationDataType = z.infer<typeof runSimulationData>;
