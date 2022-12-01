import { TRPCError } from "@trpc/server";
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

        await prisma.period.deleteMany({});

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
    get: protectedProcedure.query(({ ctx: { user } }) => {
      if (user) {
        return {
          categories: user.categories,
        };
      }
    }),
    create: protectedProcedure
      .input(categoryDataServer)
      .mutation(({ input, ctx: { user } }) => {
        console.log("hey", user.name);
        console.log("INPUT", input);
      }),
  }),
});
