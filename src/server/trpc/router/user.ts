import { profileData } from "prisma/zod-utils";
import { router, protectedProcedure } from "../trpc";
import { Prisma } from "@prisma/client";
import slugify from "utils/slugify";
import { resizeBase64Image } from "server/common/resizeBase64Image";
import { TRPCError } from "@trpc/server";

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
        salary: user.salary,
      };
    }
  }),
  updateProfile: protectedProcedure
    .input(profileData)
    .mutation(async ({ input, ctx }) => {
      const { prisma, user } = ctx;
      const data: Prisma.UserUpdateInput = input;
      if (input?.username) {
        data.username = slugify(input?.username);
      }
      if (input?.avatar) {
        data.avatar = await resizeBase64Image(input?.avatar);
      }

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
});
