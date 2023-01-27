import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import cc from "currency-codes";
import { first } from "lodash";
import { NOT_AVAILABLE_EXCHANGE_RATES_CURRENCY_CODES } from "utils/constants";

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
  // input should be an object that can only be currency values used in the app
  seedExchangeRates: protectedProcedure.mutation(async ({ ctx }) => {
    const { prisma } = ctx;
    const now = Date.now();
    await prisma.exchangeRate.deleteMany();
    const firstRate = await prisma.exchangeRate.findFirst({
      where: {
        id: 1,
      },
      select: {
        nextUpdateUnix: true,
      },
    });
    const nextUpdateTimeSeconds = firstRate
      ? firstRate.nextUpdateUnix * 1000
      : null;

    const seedCurrencyExchangeData = async (code: string, times = 0) => {
      let result;

      if (times < 3) {
        try {
          result = await fetch(`https://open.er-api.com/v6/latest/${code}`);
          const jsonData = (await result.json()) as unknown as Record<
            string,
            string
          > & {
            result: string;
            time_next_update_unix: string;
            base_code: string;
            rates: Record<string, string>;
          };

          if (jsonData.result === "error") {
            seedCurrencyExchangeData(code, times + 1);
          } else {
            await prisma.exchangeRate.create({
              data: {
                nextUpdateUnix: +jsonData.time_next_update_unix,
                currency: jsonData.base_code,
                rates: JSON.stringify(jsonData.rates),
              },
            });
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        console.error("Couldn't fetch data for this currency", code);
      }

      return null;
    };

    if (!firstRate || (nextUpdateTimeSeconds && nextUpdateTimeSeconds <= now)) {
      await prisma.exchangeRate.deleteMany();

      cc.codes()
        .filter(
          (code) => !NOT_AVAILABLE_EXCHANGE_RATES_CURRENCY_CODES.includes(code)
        )
        .map((code) => seedCurrencyExchangeData(code));
    } else {
      const latest = await fetch(`https://open.er-api.com/v6/latest`);

      latest.json().then((result) => {
        console.warn(
          "Exchange rates already updated, next update: ",
          result.time_next_update_utc
        );
      });
    }
  }),
});
