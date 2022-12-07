import { TRPCError } from "@trpc/server";
import _ from "lodash";
import { categoryDataServer, salaryDataServer } from "prisma/*";
import { protectedProcedure, router } from "../trpc";

export const simulationRouter = router({
  salary: router({
    updateOrCreate: protectedProcedure
      .input(salaryDataServer)
      .mutation(async ({ input, ctx }) => {
        const { prisma, user } = ctx;
        let salary;

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

        const userToUpdate = await prisma.user.findUnique({
          where: {
            id: user?.id,
          },
        });

        if (!userToUpdate) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

        await prisma.period.deleteMany({
          where: {
            salary: {
              userId: user.id,
            },
          },
        });

        if (input.variance) {
          salary = {
            ...input,
            variance: {
              create: input.variance,
            },
          };
        } else {
          salary = {
            ...input,
          };
        }

        await prisma.user.update({
          where: {
            id: user?.id,
          },
          data: {
            salary: {
              upsert: {
                update: salary,
                create: salary,
              },
            },
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
        include: {
          records: true,
        },
      });
    }),
    createOrUpdate: protectedProcedure
      .input(categoryDataServer)
      .mutation(async ({ input, ctx }) => {
        const { prisma, user } = ctx;

        const userToUpdate = await prisma.user.findUnique({
          where: {
            id: user.id,
          },
        });

        if (!userToUpdate) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
        }

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
