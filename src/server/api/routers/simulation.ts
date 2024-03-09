import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { OptCatInputType, OptSalInputType, catInputZod, salInputZod } from "../../../../prisma/zod-utils";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { ErrorCode } from "~/lib/auth";
import { DEFAULT_FREQUENCY } from "~/lib/constants";
import { Category, Prisma, Record, Salary } from "@prisma/client";

export const simulationRouter = createTRPCRouter({
    salaries: createTRPCRouter({
        get: protectedProcedure.query(async ({ ctx }) => {
            const { db, user } = ctx;

            if (!user) {
                throw new TRPCError({ message: ErrorCode.UserNotFound, code: "NOT_FOUND" });
            }

            return await db.salary.findMany({
                where: {
                    userId: user.id,
                },
                orderBy: {
                    id: "desc",
                },
                include: {
                    variance: true,
                },
            });
        }),
        delete: protectedProcedure
            .input(z.object({ id: z.bigint().positive() }))
            .mutation(async ({ input, ctx }) => {
                const { db } = ctx;

                await db.salary.delete({
                    where: {
                        id: input.id,
                    },
                });
            }),
        createOrUpdate: protectedProcedure
            .input(salInputZod)
            .mutation(async ({ input: salary, ctx }) => {
                const { db, user } = ctx;

                if (!user) {
                    throw new TRPCError({ message: ErrorCode.UserNotFound, code: "NOT_FOUND" });
                }

                // parsse salary
                const variance = salary.variance;
                delete salary.variance;

                const optFields: Required<Omit<OptSalInputType, 'id'>> = {
                    title: salary.title || 'Job',
                }
                const parsedSalary: Omit<Salary, 'id' | 'userId'> = {
                    ...salary,
                    ...optFields,
                    currency: salary.currency.value,
                    taxType: salary.taxType.value,
                }
                const isVarianceValid = variance && variance.length > 0;

                // update or create category
                if (isVarianceValid) {
                    variance.reduce((prev, crr, index) => {
                        if (prev.from >= crr.from) {
                            throw new TRPCError({
                                code: "PARSE_ERROR",
                                message: `Invalid periods order. Please try again. ${index}`,
                            });
                        }

                        return crr;
                    });
                }

                const opType = salary.id ? 'update' : 'create'
                if (opType === 'update') {
                    let salaryData: Omit<Prisma.SalaryCreateInput, 'user'>;
                    if (isVarianceValid) {
                        const periodsToCreate = []
                        for (const period of variance) {
                            const opType = period?.id ? 'update' : 'create'
                            if (opType === 'update') {
                                await db.period.update({
                                    where: {
                                        id: period.id,
                                    },
                                    data: period
                                })
                            }
                            if (opType === 'create') {
                                periodsToCreate.push(period)
                            }
                        }

                        salaryData = {
                            ...parsedSalary,
                            ...(periodsToCreate.length > 0 && {
                                variance: {
                                    create: periodsToCreate
                                }
                            })
                        }
                    } else {
                        await db.period.deleteMany({
                            where: {
                                salaryId: salary.id,
                            },
                        });
                        salaryData = {
                            ...parsedSalary,
                        }
                    }

                    const updatedCategory = await db.salary.update({
                        where: {
                            id: salary.id,
                        },
                        data: salaryData
                    });

                    return updatedCategory.id
                }
                if (opType === 'create') {
                    const newSalary = await db.salary.create({
                        data: {
                            ...parsedSalary,
                            ...(isVarianceValid && {
                                variance: {
                                    create: variance
                                }
                            }),
                            user: {
                                connect: {
                                    id: user.id,
                                },
                            },
                        },
                    });

                    return newSalary.id
                }
            }),
        variance: createTRPCRouter({
            delete: protectedProcedure
                .input(z.object({ id: z.bigint().positive() }))
                .mutation(async ({ input, ctx }) => {
                    const { db } = ctx;

                    await db.period.delete({
                        where: {
                            id: input.id,
                        },
                    });

                })
        }),
    }),
    categories: createTRPCRouter({
        get: protectedProcedure.query(async ({ ctx }) => {
            const { db, user } = ctx;

            if (!user) {
                throw new TRPCError({ message: ErrorCode.UserNotFound, code: "NOT_FOUND" });
            }

            return await db.category.findMany({
                where: {
                    userId: user.id,
                },
                orderBy: {
                    id: "desc",
                },
                include: {
                    records: true,
                },
            });
        }),
        delete: protectedProcedure
            .input(z.object({ id: z.bigint().positive() }))
            .mutation(async ({ input, ctx }) => {
                const { db } = ctx;

                await db.category.delete({
                    where: {
                        id: input.id,
                    },
                });
            }),
        createOrUpdate: protectedProcedure
            .input(catInputZod)
            .mutation(async ({ input: category, ctx }) => {
                const { db, user } = ctx;

                if (!user) {
                    throw new TRPCError({ message: ErrorCode.UserNotFound, code: "NOT_FOUND" });
                }

                // parse category
                const records = category.records;
                delete category.records;

                const optFields: Required<Omit<OptCatInputType, 'id'>> = {
                    inflVal: category.inflVal || user.inflation,
                    icon: category.icon || "Icon",
                    frequency: category.frequency || DEFAULT_FREQUENCY,
                }
                const parsedCategory: Omit<Category, 'id' | 'userId'> = {
                    ...category,
                    ...optFields,
                    currency: category.currency.value,
                    type: category.type.value,
                    inflType: category.inflType.value,
                    country: category.country.value,
                    freqType: category.freqType.value,
                }
                const parsedCategoryRecords: (Omit<Record, 'id' | 'categoryId'> & { id?: bigint })[] | undefined = records?.map((record) => ({
                    ...record,
                    title: record.title || "",
                    frequency: record.frequency || DEFAULT_FREQUENCY,
                    country: record.country.value,
                    type: record.type.value,
                    inflation: record.inflation || user.inflation,
                    currency: record.currency?.value || user.currency,
                }));
                const isParsedCategoryRecordsValid = parsedCategoryRecords && parsedCategoryRecords.length > 0

                // update or create category
                const opType = category.id ? 'update' : 'create'
                if (opType === 'update') {
                    let categoryData: Omit<Prisma.CategoryCreateInput, 'user'>;
                    if (isParsedCategoryRecordsValid) {
                        const recordsToCreate = []
                        for (const record of parsedCategoryRecords) {
                            const opType = record?.id ? 'update' : 'create'
                            if (opType === 'update') {
                                await db.record.update({
                                    where: {
                                        id: record.id,
                                    },
                                    data: record
                                })
                            }
                            if (opType === 'create') {
                                recordsToCreate.push(record)
                            }
                        }

                        categoryData = {
                            ...parsedCategory,
                            ...(recordsToCreate.length > 0 && {
                                records: {
                                    create: recordsToCreate
                                }
                            })
                        }
                    } else {
                        await db.record.deleteMany({
                            where: {
                                categoryId: category.id,
                            },
                        });
                        categoryData = {
                            ...parsedCategory,
                        }
                    }

                    const updatedCategory = await db.category.update({
                        where: {
                            id: category.id,
                        },
                        data: categoryData
                    });
                    return updatedCategory.id
                }

                if (opType === 'create') {
                    const newCategory = await db.category.create({
                        data: {
                            ...parsedCategory,
                            ...(isParsedCategoryRecordsValid && {
                                records: {
                                    create: parsedCategoryRecords
                                }
                            }),
                            user: {
                                connect: {
                                    id: user.id,
                                },
                            },
                        },
                    });

                    return newCategory.id
                }
            }),
        records: createTRPCRouter({
            delete: protectedProcedure
                .input(z.object({ id: z.bigint().positive() }))
                .mutation(async ({ input, ctx }) => {
                    const { db } = ctx;

                    await db.record.delete({
                        where: {
                            id: input.id,
                        },
                    });
                })
        })
    }),
});
