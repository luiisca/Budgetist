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

const percentage = numberInput.max(100, { message: "Invalid percentage" });

export const selectOptions = z.object({
    value: z.string(),
    label: z.string(),
});

// profile
export const profileInputZod = z.object({
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
export const optSalVarianceInputZod = z.object({
    taxPercent: percentage.optional(),
})
export const optSalInputZod = z.object({
    id: z.bigint().positive().optional(),
    title: z.string().optional(),
    variance: z
        .array(
            optSalVarianceInputZod.extend({
                from: numberInput,
                amount: numberInput,
            }).required()
        )
        .optional(),
})
export const salInputZod = optSalInputZod.extend({
    currency: selectOptions,
    amount: numberInput,
    taxType: selectOptions,
    taxPercent: percentage,
});

// categories
export const optCatInputZod = z.object({
    id: z.bigint().positive().optional(),
    inflVal: percentage.optional(),
    icon: z.string().optional(),
    frequency: yearFrequency.optional(),
})
export const optCatRecordInputZod = z.object({
    id: z.bigint().positive().optional(),
    title: z.string().optional(),
    frequency: yearFrequency.optional(),
    inflation: percentage.optional(),
    currency: selectOptions.optional(),
})
export const catInputZod = optCatInputZod.extend({
    title: nonEmptyString,
    budget: numberInput,
    currency: selectOptions,
    type: selectOptions,
    inflType: selectOptions,
    country: selectOptions,

    records: z
        .array(
            optCatRecordInputZod.extend({
                amount: numberInput,
                inflType: z.boolean(),
                type: selectOptions,
                country: selectOptions,
            })
        )
        .optional(),
    freqType: selectOptions,
});

// run simulation
export const runSimInputZod = z.object({
    years: nonEmptyString.or(z.number().positive()),
});

export type ProfileInputType = z.infer<typeof profileInputZod>;

export type OptSalVarianceInputType = z.infer<typeof optSalVarianceInputZod>;
export type OptSalInputType = z.infer<typeof optSalInputZod>;
export type SalInputType = z.infer<typeof salInputZod>;

export type OptCatRecordInputType = z.infer<typeof optCatRecordInputZod>;
export type OptCatInputType = z.infer<typeof optCatInputZod>;
export type CatInputType = z.infer<typeof catInputZod>;
export type RunSimInputType = z.infer<typeof runSimInputZod>;
