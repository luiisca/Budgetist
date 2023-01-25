import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const externalRouter = router({
  inflation: protectedProcedure
    .input(z.string())
    .query(async ({ input: country }) => {
      let value;
      try {
        const result = await fetch(
          `https://api.api-ninjas.com/v1/inflation?country=${country}`,
          {
            method: "GET",
            headers: {
              "X-Api-Key": process.env.NINJA_API_KEY || "",
              "Content-Type": "application/json",
            },
          }
        );
        value = result.json() as unknown as Array<
          Record<string, string> & {
            yearly_rate_pct: string;
          }
        >;
      } catch (e) {
        return [];
      }
      return value;
    }),
});
