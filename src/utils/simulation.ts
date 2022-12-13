import { AppRouter } from "server/trpc/router/_app";
import {
  DEFAULT_FREQUENCY,
  DEFAULT_INDEX_RETURN,
  MAX_YEARS,
  MIN_YEARS,
} from "./constants";
import { AppRouterTypes } from "./trpc";

// const user = {
//   country: "usa",
//   inflation: 8,
//   currency: "USD",
//   investPerc: 75,
//   indexReturn: DEFAULT_INDEX_RETURN,
// };
//
// const salary = {
//   title: "Salary",
//   currency: user.currency,
//   amount: 2000,
//   variance: [
//     {
//       from: 1,
//       amount: 2000,
//     },
//     {
//       from: 3,
//       amount: 4000,
//     },
//     {
//       from: 6,
//       amount: 10000,
//     },
//   ],
// };
//
// export const categories: Array<Category> = [
//   {
//     title: "Teaching",
//     budget: 400,
//     currency: user.currency,
//     type: "income",
//     inflType: false,
//     country: user.country,
//     inflVal: user.inflation,
//     color: "green",
//     icon: "pen",
//     records: [
//       {
//         title: "spanish",
//         type: "income",
//         amount: 300,
//         frequency: 1,
//         inflation: 0,
//         currency: user.currency,
//       },
//       {
//         title: "english",
//         type: "income",
//         amount: 300,
//         frequency: 2,
//         inflation: 0,
//         currency: user.currency,
//       },
//       {
//         title: "math",
//         type: "income",
//         amount: 30,
//         frequency: 1,
//         inflation: 0,
//         currency: user.currency,
//       },
//       {
//         title: "coding",
//         type: "income",
//         amount: 100,
//         frequency: 2,
//         inflation: 0,
//         currency: user.currency,
//       },
//     ],
//     frequency: 12,
//   },
//   {
//     title: "Housing",
//     budget: 1400,
//     currency: user.currency,
//     type: "perRec",
//     inflType: "perCat",
//     country: user.country,
//     inflVal: 5,
//     color: "pink",
//     icon: "house",
//     records: [
//       {
//         title: "window",
//         type: "outcome",
//         amount: 300,
//         frequency: 4,
//         inflation: 4,
//         currency: user.currency,
//       },
//       {
//         title: "door",
//         type: "outcome",
//         amount: 30,
//         frequency: 1,
//         inflation: user.inflation,
//         currency: "PEN",
//       },
//       {
//         title: "mouse",
//         type: "outcome",
//         amount: 100,
//         frequency: 1,
//         inflation: 4,
//         currency: user.currency,
//       },
//       {
//         title: "rental",
//         type: "income",
//         amount: 200,
//         frequency: 6,
//         inflation: 8,
//         currency: user.currency,
//       },
//     ],
//     frequency: 12,
//   },
//   {
//     title: "Health",
//     budget: 400,
//     currency: user.currency,
//     type: "outcome",
//     inflType: "perCat",
//     country: "pe",
//     inflVal: 4,
//     color: "red",
//     icon: "medkit",
//     records: null,
//     frequency: 8,
//   },
// ];

const convertToUSD = (currency: string, amount: number) => {
  if (currency !== "USD") {
    // console.log("no USD currency set");
    // console.log("converting to USD");
    // return toUSD(currency, amount)
  }
  return amount;
};

const getRate = (x: number) => x / 100;
const getFrequency = (freq: number) => {
  if (!freq) return DEFAULT_FREQUENCY;
  return freq < 1 ? 1 : freq > DEFAULT_FREQUENCY ? DEFAULT_FREQUENCY : freq;
};

const getSalaryByYear = (year: number, salary: any) => {
  let yearlyAmount = salary.amount;
  const v = salary.variance;

  if (v) {
    for (let period = 0; period < v.length; period++) {
      const betweenCrrPeriod =
        year >= v[period].from && year < v[period + 1].from;
      const lastV = v[v.length - 1];
      const latestPeriod = year >= lastV.from;

      if (betweenCrrPeriod) {
        // console.log("THIS YEAR", year, v[period]);
        yearlyAmount = v[period].amount;

        return yearlyAmount;
      }

      if (latestPeriod) {
        yearlyAmount = lastV.amount;

        return yearlyAmount;
      }
    }
  }

  return yearlyAmount;
};

type Category = AppRouterTypes["simulation"]["categories"]["get"]["output"];

export const getTotalBalance = (
  categories: Category,
  salary: any,
  years: number,
  investPerc: number,
  indexReturn: number
): number => {
  years =
    years && years <= 0 ? MIN_YEARS : years > MAX_YEARS ? MAX_YEARS : years;

  let total = 0;
  let yearExpenses = 0;
  // console.log("INSIDE GET_TOTAL_BALANCE");

  const catsAccExp: Array<{
    spent: number;
    records: Array<{ spent: number }> | [];
  }> = categories.map((cat) => ({
    spent: cat.budget,
    records:
      cat.records === null
        ? []
        : cat.records.map((record) => ({ spent: record.amount })),
  }));

  for (let year = 1; year <= years; year++) {
    // 1. const allCatExpenses = iterate over Categories
    // Calculate total expenses of all categories over 1 year and store those values in accArr for next years calculations
    console.log(`YEAR ${year}`);

    yearExpenses = categories.reduce(
      (prevCat: number, crrCat, crrCatI: number) => {
        const INCOME_MOD = -1;

        if (!crrCat.records || crrCat.records?.length === 0) {
          // console.log(`NO RECORDS ${crr.title}`);

          // helpers
          const inflationDisabled =
            crrCat.type === "income" ||
            (crrCat.type === "outcome" && crrCat.inflType === "");
          const inflationEnabled =
            crrCat.type === "outcome" && crrCat.inflType !== "";

          crrCat.budget = convertToUSD(crrCat.currency, crrCat.budget);
          const frequency =
            crrCat.freqType === "perCat" ? crrCat.frequency : DEFAULT_FREQUENCY;
          //

          if (inflationDisabled) {
            const crrYearCatExp =
              crrCat.budget * getFrequency(frequency) * INCOME_MOD;
            // console.log(`Current year spent for ${crr.title}: ${crrYearCatExp}`);

            return prevCat + crrYearCatExp;
          }

          if (inflationEnabled) {
            const crrCatAccExp = catsAccExp[crrCatI].spent;
            // after the first iteration we've got how much they make on a year so no need to multiply by freq again
            const freqMod = year === 1 ? getFrequency(frequency) : 1;
            const P = crrCatAccExp * freqMod;
            const i = getRate(crrCat.inflVal);

            // calculating new total crrCat year expense after inflation
            const crrYearCatExp = P * (1 + i);

            // console.log("PREVIOUS SPENT", catsAccExp[i].spent);
            // console.log(
            //   "FRECUENCY",
            //   year === 1 ? getFrequency(crr.frequency) : 1
            // );

            // Save acc cat expense for future calculations
            catsAccExp[crrCatI].spent = crrYearCatExp;
            // console.log(`Current year spent for ${crr.title}: ${crrYearSpent}`);

            return prevCat + crrYearCatExp;
          }
        } else {
          // console.log(`RECORDS ${crrCat.title}`);
          const crrYearCatExp = crrCat.records.reduce(
            (prevRec: number, crrRec, crrRecI: number) => {
              // convert all amounts to USD before running as there can be many different curencies

              crrRec.amount = convertToUSD(
                crrCat.currency === "perRec"
                  ? crrRec.currency
                  : crrCat.currency,
                crrRec.amount
              );

              // helpers
              const perCatIncome = crrCat.type === "income";
              const perCatOutcome = crrCat.type === "outcome";
              const perRecIncome = crrRec.type === "income";
              const perRecOutcome = crrRec.type === "outcome";

              const inflationDisabled =
                crrCat.inflType === "" || perRecIncome || !crrRec.inflType;
              const inflationEnabled =
                (perCatIncome && perRecOutcome) ||
                (perCatOutcome && crrCat.inflType === "perCat") ||
                (perCatOutcome &&
                  crrCat.inflType === "perRec" &&
                  perRecOutcome);

              const frequency =
                crrCat.freqType === "perRec"
                  ? crrRec.frequency
                  : crrCat.frequency;
              //

              if (inflationDisabled) {
                const crrYearSpent =
                  crrRec.amount * getFrequency(frequency) * INCOME_MOD;
                // console.log(
                //   `Current year spent for ${crrRec.title}: ${crrYearSpent}`
                // );

                return prevRec + crrYearSpent;
              }
              if (inflationEnabled) {
                const crrAccRecExp = catsAccExp[crrCatI].records[crrRecI].spent;
                // after first we've got how much they make on a year so no need to multiply by freq again
                const freqMod = year === 1 ? getFrequency(frequency) : 1;
                const P = crrAccRecExp * freqMod;
                const i =
                  crrCat.inflType === "perRec"
                    ? getRate(crrRec.inflation)
                    : getRate(crrCat.inflVal);

                const crrYearRecSpent = P * (1 + i);

                // console.log(
                //   `Current year spent for ${crrRec.title}: ${crrYearSpent}`
                // );
                // console.log(
                //   "PREVIOUS SPENT",
                //   catsAccExp[i].records[crrRecI].spent
                // );
                // console.log(
                //   "FREQUENCY",
                //   year === 1 ? getFrequency(crrRec.frequency) : 1
                // );
                // console.log(
                //   "RATE",
                //   1 + crr.inflType === "perRec"
                //     ? getRate(crrRec.inflation)
                //     : getRate(crr.inflVal)
                // );
                catsAccExp[crrCatI].records[crrRecI].spent = crrYearRecSpent;

                return prevRec + crrYearRecSpent;
              }

              return prevRec + 0;
            },
            0
          );

          // console.log(`${crr.title} expenses: `, yearCatExpenses);

          return prevCat + crrYearCatExp;
        }

        return prevCat;
      },
      0
    );
    console.log(`Expenses for year ${year}`, yearExpenses);

    const yearSalary = salary.variance
      ? getSalaryByYear(year, salary)
      : salary.amount;
    console.log(`SALARY AT YEAR ${year}: ${yearSalary}`);

    const yearBalance = yearSalary - yearExpenses;
    console.log(`YEAR BALANCE AT YEAR ${year}: ${yearBalance}`);

    const moneyReadyToInvest = yearBalance * getRate(investPerc);
    console.log("MONEY READY TO INVEST: ", moneyReadyToInvest);

    console.log("PREVIOUS TOTAL", total);

    const P = total + moneyReadyToInvest;
    const i = getRate(indexReturn);
    total = P * (1 + i);

    console.log("NEW TOTAL", total);
  }

  return total;
};
