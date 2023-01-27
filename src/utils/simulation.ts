import { SimRunPayloadType } from "pages/simulation";
import { DEFAULT_FREQUENCY, MAX_YEARS, MIN_YEARS } from "./constants";
import { AppRouterTypes } from "./trpc";

export type Salary = {
  title: string;
  amount: number;
  taxType: string;
  taxPercent: number;
  currency: string;
  variance: {
    from: number;
    amount: number;
    taxPercent: number;
  }[];
};

export type CategoriesType =
  AppRouterTypes["simulation"]["categories"]["get"]["output"];
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
  amountBefTax: number;
  amountAftTax: number;
  taxPercent: number;
};

export type YearBalanceType = {
  income: number;
  outcome: number;
  categoriesBalance: CatBalanceType[];
  salariesBalance: SalBalanceType[];
};

/**
 * @param exchangeRate how much `currentCurrency` amount is equal to 1 `userCurrency`
 *
 * Convert `currentCurrency` amount to equivalent amount in `userCurrency` and round result to 2 decimal places
 */
const convertToUserCurr = ({
  userCurrency,
  currentCurrency,
  exchangeRate,
  amount,
}: {
  userCurrency: string;
  currentCurrency: string;
  exchangeRate: number;
  amount: number;
}) => {
  console.log("USERCURRENCY", userCurrency);
  if (currentCurrency !== userCurrency) {
    console.log(`no ${userCurrency} currency set`);
    console.log("converting to USD");

    // userCurrency = USD
    // currentCurrency = PEN
    // exchangeRate = 1 USD => 4 PEN
    // e.i 1000 PEN / 4 PEN = 1USD => 250 USD
    const convertedAmount = amount / exchangeRate;

    return Math.round((convertedAmount + Number.EPSILON) * 100) / 100;
  }
  return amount;
};

const getRate = (x: number) => x / 100;
const getFrequency = (freq: number) => {
  if (!freq) return DEFAULT_FREQUENCY;
  return freq < 1 ? 1 : freq > DEFAULT_FREQUENCY ? DEFAULT_FREQUENCY : freq;
};

const getSalaryAfterTax = (amount: number, taxPercent: number) =>
  amount * (1 - getRate(taxPercent));
const getSalaryDataByYear = (year: number, salary: Salary): Salary => {
  let yearlyAmount = salary.amount;
  let yearlyTaxes = salary.taxPercent;
  const v = salary.variance;

  if (v) {
    for (let period = 0; period < v.length; period++) {
      const betweenCrrPeriod =
        year >= v[period].from && year < v[period + 1].from;
      const lastV = v[v.length - 1];
      const latestPeriod = year >= lastV.from;

      if (betweenCrrPeriod) {
        yearlyAmount = v[period].amount;
        yearlyTaxes = v[period].taxPercent;

        return {
          ...salary,
          amount: yearlyAmount,
          taxPercent: yearlyTaxes,
        };
      }

      if (latestPeriod) {
        yearlyAmount = lastV.amount;
        yearlyTaxes = lastV.taxPercent;

        return {
          ...salary,
          amount: yearlyAmount,
          taxPercent: yearlyTaxes,
        };
      }
    }
  }

  return {
    ...salary,
    amount: yearlyAmount,
    taxPercent: yearlyTaxes,
  };
};

export const getTotalBalance = ({
  categories,
  salaries,
  years,
  investPerc,
  indexReturn,
  exchangeRates,
}: SimRunPayloadType): {
  total: number;
  balanceHistory: YearBalanceType[];
} => {
  years =
    years && years <= 0 ? MIN_YEARS : years > MAX_YEARS ? MAX_YEARS : years;

  let total = 0;
  let yearExpenses = 0;
  const userCurrency = Object.keys(exchangeRates)[0];

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
        spent: convertToUserCurr({
          userCurrency,
          currentCurrency: cat.currency,
          exchangeRate: exchangeRates[cat.currency],
          amount: cat.budget,
        }),
        records:
          cat.records === null
            ? []
            : cat.records.map((record) => {
                const currentCurrency =
                  cat.currency === "perRec" ? record.currency : cat.currency;

                return {
                  title: record.title,
                  type: record.type,
                  inflation: record.type === "income" ? 0 : record.inflation,
                  frequency:
                    cat.freqType === "perCat"
                      ? cat.frequency
                      : record.frequency,
                  spent: convertToUserCurr({
                    userCurrency,
                    currentCurrency,
                    exchangeRate: exchangeRates[currentCurrency],
                    amount: cat.budget,
                  }),
                };
              }),
      })),
      salariesBalance: salaries.map((salary) => {
        const crrYearSalaryData = salary.variance
          ? getSalaryDataByYear(i + 1, salary)
          : salary;

        const amount = crrYearSalaryData.amount;
        const convertedAmount = convertToUserCurr({
          userCurrency,
          currentCurrency: crrYearSalaryData.currency,
          exchangeRate: exchangeRates[crrYearSalaryData.currency],
          amount,
        });
        console.log("Salary amount", amount, typeof amount, convertedAmount);
        const taxPercent =
          salary.taxType == "perCat"
            ? salary.taxPercent
            : crrYearSalaryData.taxPercent;

        return {
          title: salary.title,
          type: "salary",
          amountBefTax: convertedAmount,
          amountAftTax: getSalaryAfterTax(convertedAmount, taxPercent),
          taxPercent,
        };
      }),
    }));

  for (let year = 1; year <= years; year++) {
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

          const convertedBudget = convertToUserCurr({
            userCurrency,
            currentCurrency: crrCat.currency,
            exchangeRate: exchangeRates[crrCat.currency],
            amount: crrCat.budget,
          });

          const frequency =
            crrCat.freqType === "perCat" ? crrCat.frequency : DEFAULT_FREQUENCY;
          //

          if (inflationDisabled) {
            const crrYearCatExp = convertedBudget * getFrequency(frequency);

            // save current year expense
            balanceHistory[year - 1].categoriesBalance[crrCatI].spent =
              crrYearCatExp;
            // accumulate current year expense towards either income or outcome
            balanceHistory[year - 1][perCatIncome ? "income" : "outcome"] +=
              crrYearCatExp;

            return (
              prevCat +
              crrYearCatExp * (perCatIncome ? INCOME_MOD : OUTCOME_MOD)
            );
          }

          if (inflationEnabled) {
            // we need prev data to calculate compounding effect for crr year
            const prevYearData = balanceHistory[year === 1 ? 0 : year - 2];
            const prevYearAccCatExp =
              prevYearData.categoriesBalance[crrCatI].spent;

            // after the first iteration we've got how much they make on a year so no need to multiply by freq again
            const freqMod = year === 1 ? getFrequency(frequency) : 1;
            const P = prevYearAccCatExp * freqMod;
            const i = getRate(crrCat.inflVal);

            const crrYearExp = P * (1 + i);

            // save current year expense
            balanceHistory[year - 1].categoriesBalance[crrCatI].spent =
              crrYearExp;
            // accumulate current year expense
            balanceHistory[year - 1][perCatIncome ? "income" : "outcome"] +=
              crrYearExp;

            return prevCat + crrYearExp;
          }
        } else {
          const crrYearCatExp = crrCat.records.reduce(
            (prevRec: number, crrRec, crrRecI: number) => {
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

              const currentCurrency =
                crrCat.currency === "perRec"
                  ? crrRec.currency
                  : crrCat.currency;

              const convertedAmount = convertToUserCurr({
                userCurrency,
                currentCurrency,
                exchangeRate: exchangeRates[currentCurrency],
                amount: crrCat.budget,
              });
              const frequency =
                crrCat.freqType === "perRec"
                  ? crrRec.frequency
                  : crrCat.frequency;
              //

              if (inflationDisabled) {
                const crrYearRecExp = convertedAmount * getFrequency(frequency);

                // save current year record expense
                balanceHistory[year - 1].categoriesBalance[crrCatI].records[
                  crrRecI
                ].spent = crrYearRecExp;
                // accumulate current year record expense
                balanceHistory[year - 1][perRecIncome ? "income" : "outcome"] +=
                  crrYearRecExp;

                return (
                  prevRec +
                  crrYearRecExp * (perRecIncome ? INCOME_MOD : OUTCOME_MOD)
                );
              }
              if (inflationEnabled) {
                // we need prev data to calculate compounding effect for crr year
                const prevYearData = balanceHistory[year === 1 ? 0 : year - 2];
                const prevYearAccRecExp =
                  prevYearData.categoriesBalance[crrCatI].records[crrRecI]
                    .spent;

                // after first year we've got how much they make on a year so no need to multiply by freq again
                const freqMod = year === 1 ? getFrequency(frequency) : 1;
                const P = prevYearAccRecExp * freqMod;
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

    const yearSalary = balanceHistory[year - 1].salariesBalance.reduce(
      (prevSal: number, crrSal) => prevSal + crrSal.amountAftTax,
      0
    );
    balanceHistory[year - 1].income += yearSalary;

    const yearBalance = yearSalary - yearExpenses;

    const moneyReadyToInvest = yearBalance * getRate(investPerc);

    const P = total + moneyReadyToInvest;
    const i = getRate(indexReturn);
    total = P * (1 + i);
  }

  return {
    total,
    balanceHistory,
  };
};
