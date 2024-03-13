import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { catInputZod, salInputZod } from "../../../../prisma/zod-utils";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { ErrorCode } from "~/lib/auth";
import { Prisma } from "@prisma/client";
import parseCatInputData from "./_lib/parse-cat-input-data";
import parseSalaryInputData from "./_lib/parse-salary-input-data";

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
                    id: "asc",
                },
                select: {
                    id: true,
                    title: true,
                    currency: true,
                    amount: true,
                    taxType: true,
                    taxPercent: true,
                    variance: {
                        select: {
                            id: true,
                            from: true,
                            amount: true,
                            taxPercent: true,
                        },
                        orderBy: {
                            id: 'asc'
                        }
                    },
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

                // remove periods
                console.log('periodsIdsToRemove', salary.periodsIdsToRemove)
                salary.periodsIdsToRemove?.forEach(async (periodId) => {
                    await db.period.delete({
                        where: {
                            id: periodId
                        }
                    })
                })

                // parse salary
                const { parsedSalary, variance } = parseSalaryInputData(salary)
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

                    const updatedSalary = await db.salary.update({
                        where: {
                            id: salary.id,
                        },
                        data: salaryData,
                        select: {
                            id: true,
                            variance: {
                                select: {
                                    id: true,
                                },
                                orderBy: {
                                    id: 'asc'
                                }
                            }
                        }
                    });

                    return {
                        id: updatedSalary.id,
                        varianceIds: updatedSalary.variance
                    }
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
                        select: {
                            id: true,
                            variance: {
                                select: {
                                    id: true,
                                },
                                orderBy: {
                                    id: 'asc'
                                }
                            }
                        }
                    });

                    return {
                        id: newSalary.id,
                        varianceIds: newSalary.variance
                    }
                }
            }),
    }),
    categories: createTRPCRouter({
        get: protectedProcedure
            .query(async ({ ctx }) => {
                const { db, user } = ctx;

                if (!user) {
                    throw new TRPCError({ message: ErrorCode.UserNotFound, code: "NOT_FOUND" });
                }

                return await db.category.findMany({
                    where: {
                        userId: user.id,
                    },
                    orderBy: {
                        id: "asc",
                    },
                    select: {
                        id: true,
                        inflVal: true,
                        icon: true,
                        frequency: true,
                        title: true,
                        budget: true,
                        currency: true,
                        type: true,
                        inflType: true,
                        country: true,
                        freqType: true,
                        records: {
                            select: {
                                id: true,
                                title: true,
                                frequency: true,
                                inflation: true,
                                currency: true,
                                amount: true,
                                inflType: true,
                                type: true,
                                country: true,
                            },
                            orderBy: {
                                id: 'asc'
                            }
                        }
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

                // remove records
                console.log('recordsIdsToRemove', category.recordsIdsToRemove)
                category.recordsIdsToRemove?.forEach(async (recordId) => {
                    await db.record.delete({
                        where: {
                            id: recordId
                        }
                    })
                })

                // parse category
                const { parsedCategory, parsedCategoryRecords } = parseCatInputData(category, user)
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
                        data: categoryData,
                        select: {
                            id: true,
                            records: {
                                select: {
                                    id: true,
                                },
                                orderBy: {
                                    id: 'asc'
                                }
                            }
                        }
                    });

                    return {
                        id: updatedCategory.id,
                        recordsIds: updatedCategory.records
                    }
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
                        select: {
                            id: true,
                            records: {
                                select: {
                                    id: true,
                                },
                                orderBy: {
                                    id: 'asc'
                                }
                            }
                        }
                    });

                    return {
                        id: newCategory.id,
                        recordsIds: newCategory.records
                    }
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
