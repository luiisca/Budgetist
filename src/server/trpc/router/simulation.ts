import { TRPCError } from "@trpc/server";
import _ from "lodash";
import { categoryDataServer, salaryDataServer } from "prisma/*";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const simulationRouter = router({
  salaries: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const { prisma, user } = ctx;

      return await prisma.salary.findMany({
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
    updateOrCreate: protectedProcedure
      .input(salaryDataServer)
      .mutation(async ({ input, ctx }) => {
        const { prisma, user } = ctx;

        if (input.variance) {
          input.variance.reduce((prev, crr, index) => {
            if (prev.from >= crr.from) {
              throw new TRPCError({
                code: "PARSE_ERROR",
                message: `Invalid periods order. Please try again., ${index}`,
              });
            }

            return crr;
          });
        }

        let salary;

        if (input.variance) {
          salary = {
            ...input,
            variance: {
              create: input.variance,
            },
          };
        } else {
          salary = {
            ..._.omit(input, ["variance"]),
          };
        }

        if (input.id) {
          await prisma.period.deleteMany({
            where: {
              salaryId: input.id,
            },
          });
          await prisma.salary.update({
            where: {
              id: input.id,
            },
            data: salary,
          });
        } else {
          await prisma.salary.create({
            data: {
              ..._.omit(salary, ["id"]),
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number().positive() }))
      .mutation(async ({ input, ctx }) => {
        const { prisma } = ctx;

        await prisma.salary.delete({
          where: {
            id: input.id,
          },
        });
      }),
  }),
  categories: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const { prisma, user } = ctx;

      return await prisma.category.findMany({
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
      .input(z.object({ id: z.number().positive() }))
      .mutation(async ({ input, ctx }) => {
        const { prisma } = ctx;

        await prisma.category.delete({
          where: {
            id: input.id,
          },
        });
      }),
    createOrUpdate: protectedProcedure
      .input(categoryDataServer)
      .mutation(async ({ input, ctx }) => {
        const { prisma, user } = ctx;

        let category;

        if (input.records) {
          category = {
            ...input,
            records: {
              create: input.records,
            },
          };
        } else {
          category = {
            ..._.omit(input, ["records"]),
          };
        }

        if (input.id) {
          await prisma.record.deleteMany({
            where: {
              categoryId: input.id,
            },
          });
          await prisma.category.update({
            where: {
              id: input.id,
            },
            data: category,
          });
        } else {
          await prisma.category.create({
            data: {
              ..._.omit(category, ["id"]),
              user: {
                connect: {
                  id: user.id,
                },
              },
            },
          });
        }
      }),
  }),
});
