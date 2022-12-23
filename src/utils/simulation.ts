import _ from "lodash";
import { DEFAULT_FREQUENCY, MAX_YEARS, MIN_YEARS } from "./constants";
import { AppRouterTypes } from "./trpc";

type Salary = {
  title: string;
  amount: number;
  variance: {
    from: number;
    amount: number;
  }[];
};

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

const getSalaryByYear = (year: number, salary: Salary) => {
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

type CategoryType = AppRouterTypes["simulation"]["categories"]["get"]["output"];
export type CatBalanceType = {
  icon: string;
  title: string;
  type: string;
  inflation: number;
  frequency: number;
  spent: number;
  records:
    | Array<{
        title: string | null;
        spent: number;
        type: string;
        inflation: number;
        frequency: number;
      }>
    | [];
};
type SalBalanceType = {
  title: string;
  type: "salary";
  amount: number;
};

export type YearBalanceType = {
  income: number;
  outcome: number;
  categoriesBalance: CatBalanceType[];
  salariesBalance: SalBalanceType[];
};

export const getTotalBalance = ({
  categories,
  salaries,
  years,
  investPerc,
  indexReturn,
}: {
  categories: CategoryType;
  salaries: Salary[];
  years: number;
  investPerc: number;
  indexReturn: number;
}): {
  total: number;
  balanceHistory: YearBalanceType[];
} => {
  years =
    years && years <= 0 ? MIN_YEARS : years > MAX_YEARS ? MAX_YEARS : years;

  let total = 0;
  let yearExpenses = 0;

  const balanceHistory: YearBalanceType[] = new Array(years)
    .fill(null)
    .map((_, i) => ({
      income: 0,
      outcome: 0,
      categoriesBalance: categories.map((cat) => ({
        icon: cat.icon,
        title: cat.title,
        type: cat.type,
        inflation: cat.inflType === "income" ? 0 : cat.inflVal,
        frequency: cat.frequency,
        spent: cat.budget,
        records:
          cat.records === null
            ? []
            : cat.records.map((record) => ({
                title: record.title,
                type: record.type,
                inflation: record.type === "income" ? 0 : record.inflation,
                frequency:
                  cat.freqType === "perCat" ? cat.frequency : record.frequency,
                spent: record.amount,
              })),
      })),
      salariesBalance: salaries.map((salary) => ({
        title: salary.title,
        type: "salary",
        amount: salary.variance
          ? getSalaryByYear(i + 1, salary)
          : salary.amount,
      })),
    }));

  for (let year = 1; year <= years; year++) {
    console.log(`YEAR ${year}`);

    yearExpenses = categories.reduce(
      (prevCat: number, crrCat, crrCatI: number) => {
        const INCOME_MOD = -1;
        const OUTCOME_MOD = 1;

        if (!crrCat.records || crrCat.records?.length === 0) {
          // helpers
          const perCatIncome = crrCat.type === "income";
          const perCatOutcome = crrCat.type === "outcome";

          const inflationDisabled =
            perCatIncome || (perCatOutcome && crrCat.inflType === "");
          const inflationEnabled = perCatOutcome && crrCat.inflType !== "";

          crrCat.budget = convertToUSD(crrCat.currency, crrCat.budget);
          const frequency =
            crrCat.freqType === "perCat" ? crrCat.frequency : DEFAULT_FREQUENCY;
          //

          if (inflationDisabled) {
            const crrYearCatExp =
              crrCat.budget *
              getFrequency(frequency) *
              (perCatIncome ? INCOME_MOD : OUTCOME_MOD);

            // save current year expense
            balanceHistory[year - 1].categoriesBalance[crrCatI].spent =
              crrYearCatExp;
            // accumulate current year expense
            balanceHistory[year - 1][perCatIncome ? "income" : "outcome"] +=
              crrYearCatExp;

            return prevCat + crrYearCatExp;
          }

          if (inflationEnabled) {
            const crrCatAccExp =
              balanceHistory[year === 1 ? 0 : year - 2].categoriesBalance[
                crrCatI
              ].spent;
            // after the first iteration we've got how much they make on a year so no need to multiply by freq again
            const freqMod = year === 1 ? getFrequency(frequency) : 1;
            const P = crrCatAccExp * freqMod;
            const i = getRate(crrCat.inflVal);

            const crrYearCatExp = P * (1 + i);

            // save current year expense
            balanceHistory[year - 1].categoriesBalance[crrCatI].spent =
              crrYearCatExp;
            // accumulate current year expense
            balanceHistory[year - 1][perCatIncome ? "income" : "outcome"] +=
              crrYearCatExp;

            return prevCat + crrYearCatExp;
          }
        } else {
          const crrYearCatExp = crrCat.records.reduce(
            (prevRec: number, crrRec, crrRecI: number) => {
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
                const crrYearRecExp =
                  crrRec.amount *
                  getFrequency(frequency) *
                  (perRecIncome ? INCOME_MOD : OUTCOME_MOD);

                // save current year record expense
                balanceHistory[year - 1].categoriesBalance[crrCatI].records[
                  crrRecI
                ].spent = crrYearRecExp;
                // accumulate current year record expense
                balanceHistory[year - 1][perRecIncome ? "income" : "outcome"] +=
                  crrYearRecExp;

                return prevRec + crrYearRecExp;
              }
              if (inflationEnabled) {
                const crrAccRecExp =
                  balanceHistory[year === 1 ? 0 : year - 2].categoriesBalance[
                    crrCatI
                  ].records[crrRecI].spent;
                // after first year we've got how much they make on a year so no need to multiply by freq again
                const freqMod = year === 1 ? getFrequency(frequency) : 1;
                const P = crrAccRecExp * freqMod;
                const i =
                  crrCat.inflType === "perRec"
                    ? getRate(crrRec.inflation)
                    : getRate(crrCat.inflVal);

                const crrYearRecExp = P * (1 + i);

                // save current year record expense
                balanceHistory[year - 1].categoriesBalance[crrCatI].records[
                  crrRecI
                ].spent = crrYearRecExp;
                // accumulate current year record expense
                balanceHistory[year - 1][perRecIncome ? "income" : "outcome"] +=
                  crrYearRecExp;

                return prevRec + crrYearRecExp;
              }

              return prevRec + 0;
            },
            0
          );

          return prevCat + crrYearCatExp;
        }

        return prevCat;
      },
      0
    );
    console.log(`Expenses for year ${year}`, yearExpenses);

    const yearSalary = balanceHistory[year - 1].salariesBalance.reduce(
      (prevSal: number, crrSal) => prevSal + crrSal.amount,
      0
    );
    balanceHistory[year - 1].income += yearSalary;

    console.log(`SALARY AT YEAR ${year}: ${yearSalary}`);

    const yearBalance = yearSalary - yearExpenses;
    console.log(`YEAR BALANCE AT YEAR ${year}: ${yearBalance}`);

    const moneyReadyToInvest = yearBalance * getRate(investPerc);
    console.log("MONEY READY TO INVEST: ", moneyReadyToInvest);

    console.log("PREVIOUS TOTAL", total);

    const P = total + moneyReadyToInvest;
    const i = getRate(indexReturn);
    total = P * (1 + i);

    console.log("this function now receives data from the backend");
    console.log("NEW TOTAL", total);
  }

  return {
    total,
    balanceHistory,
  };
};
