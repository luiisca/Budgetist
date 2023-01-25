import dayjs from "dayjs";

import { profileData } from "prisma/zod-utils";
import { router, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import slugify from "utils/slugify";
import { resizeBase64Image } from "server/common/resizeBase64Image";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { sendFeedbackEmail } from "utils/emails/email-manager";
import { ErrorCode } from "utils/auth";

export const userRouter = router({
  me: protectedProcedure.query(({ ctx: { user } }) => {
    if (user) {
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
        identityProvider: user.identityProvider,
        completedOnboarding: user.completedOnboarding,
        country: user.country,
        inflation: user.inflation,
        currency: user.currency,
        investPerc: user.investPerc,
        indexReturn: user.indexReturn,
      };
    }
  }),
  updateProfile: protectedProcedure
    .input(
      profileData.extend({
        inflation: z.number().positive().optional(),
        investPerc: z
          .number()
          .positive()
          .max(100, { message: "Cannot be greater than 100%" })
          .optional(),
        indexReturn: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { prisma, user } = ctx;
      const data: Prisma.UserUpdateInput = input;
      if (input?.username) {
        data.username = slugify(input?.username);
      }
      if (input?.avatar) {
        data.avatar = await resizeBase64Image(input?.avatar);
      }
      // parse country and currency against API endpoints inputs to make sure they are valid

      const userToUpdate = await prisma.user.findUnique({
        where: {
          id: user?.id,
        },
      });

      if (!userToUpdate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      await prisma.user.update({
        where: {
          id: user?.id,
        },
        data: {
          ...data,
        },
      });
    }),
  deleteMe: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.user.id,
      },
    });

    if (!user) {
      throw new Error(ErrorCode.UserNotFound);
    }

    await ctx.prisma.user.delete({
      where: {
        id: ctx.user.id,
      },
    });
  }),
  submitFeedback: protectedProcedure
    .input(
      z.object({
        rating: z.string(),
        comment: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { rating, comment } = input;

      const feedback = {
        username: ctx.user?.username || "Nameless",
        email: ctx.user?.email || "No email address",
        rating: rating,
        comment: comment,
      };

      await ctx.prisma.feedback.create({
        data: {
          date: dayjs().toISOString(),
          userId: ctx.user.id,
          rating: rating,
          comment: comment,
        },
      });

      if (process.env.SEND_FEEDBACK_EMAIL && comment)
        sendFeedbackEmail(feedback);
    }),
});
