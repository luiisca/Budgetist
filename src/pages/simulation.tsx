import {
  Button,
  // Form,
  Input,
  // TextField,
} from "components/ui";
import { useRef, useState } from "react";
import Head from "next/head";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { profileData, ProfileDataInputType } from "prisma/zod-utils";
// import { trpc } from "utils/trpc";
import Shell from "components/ui/core/Shell";

const MIN_YEARS = 1;
const MAX_YEARS = 200;
const INDEX_ANNUAL_RETURN = 7;

type User = {
  country: string | "other";
  inflation: number;
  currency: string;
  investPerc: number;
  indexReturn: number;
};

type Salary = {
  title: string;
  currency: string;
  amount: number;
  variance:
    | Array<{
        from: number;
        amount: number;
      }>
    | false;
};

type Record = {
  title: string;
  amount: number;
  type: "income" | "outcome";

  frequency: number;
  inflation: number;
  currency: string;
};

type Category = {
  title: string;
  budget: number;
  currency: string | "perRec";
  type: "income" | "outcome" | "perRec";
  inflType: false | "perCat" | "perRec";
  country: string;
  inflVal: number;
  color: string;
  icon: string;

  // records.map((record) => ({
  //   ...record,
  //   inflation: inflType === 'perCat' ? inflVal : inflType === 'perRec' ? record.inflation : 0,
  //   currency: currency === 'perRec' ? record.currency : currency,
  // }))
  records: Array<Record> | null;
  frequency: number;
};

const user: User = {
  country: "usa",
  inflation: 8,
  currency: "USD",
  investPerc: 75,
  indexReturn: INDEX_ANNUAL_RETURN,
};

const salary: Salary = {
  title: "Salary",
  currency: user.currency,
  amount: 2000,
  variance: [
    {
      from: 1,
      amount: 2000,
    },
    {
      from: 3,
      amount: 4000,
    },
    {
      from: 6,
      amount: 10000,
    },
  ],
};

// shuoul utilize user.currency as default currency value on every category
export const categories: Array<Category> = [
  {
    title: "Teaching",
    budget: 400,
    currency: user.currency,
    type: "income",
    inflType: false,
    country: user.country,
    inflVal: user.inflation,
    color: "green",
    icon: "pen",
    records: [
      {
        title: "spanish",
        type: "income",
        amount: 300,
        frequency: 1,
        inflation: 0,
        currency: user.currency,
      },
      {
        title: "english",
        type: "income",
        amount: 300,
        frequency: 2,
        inflation: 0,
        currency: user.currency,
      },
      {
        title: "math",
        type: "income",
        amount: 30,
        frequency: 1,
        inflation: 0,
        currency: user.currency,
      },
      {
        title: "coding",
        type: "income",
        amount: 100,
        frequency: 2,
        inflation: 0,
        currency: user.currency,
      },
    ],
    frequency: 12,
  },
  {
    title: "Housing",
    budget: 1400,
    currency: user.currency,
    type: "perRec",
    inflType: "perCat",
    country: user.country,
    inflVal: 5,
    color: "pink",
    icon: "house",
    records: [
      {
        title: "window",
        type: "outcome",
        amount: 300,
        frequency: 4,
        inflation: 4,
        currency: user.currency,
      },
      {
        title: "door",
        type: "outcome",
        amount: 30,
        frequency: 1,
        inflation: user.inflation,
        currency: "PEN",
      },
      {
        title: "mouse",
        type: "outcome",
        amount: 100,
        frequency: 1,
        inflation: 4,
        currency: user.currency,
      },
      {
        title: "rental",
        type: "income",
        amount: 200,
        frequency: 6,
        inflation: 8,
        currency: user.currency,
      },
    ],
    frequency: 12,
  },
  {
    title: "Health",
    budget: 400,
    currency: user.currency,
    type: "outcome",
    inflType: "perCat",
    country: "pe",
    inflVal: 4,
    color: "red",
    icon: "medkit",
    records: null,
    frequency: 8,
  },
];

const convertToUSD = (currency: string, amount: number) => {
  if (currency !== "USD") {
    // console.log("no USD currency set");
    // console.log("converting to USD");
    // return toUSD(currency, amount)
  }
  return amount;
};

const getRate = (x: number) => x / 100;
const getFrequency = (freq: number) => (freq < 1 ? 1 : freq > 12 ? 12 : freq);

const getSalaryByYear = (year: number) => {
  let salaryByYear = salary.amount;
  const v = salary.variance;

  if (v) {
    for (let period = 0; period < v.length; period++) {
      if (year >= v[period].from && year < v[period + 1].from) {
        // console.log("THIS YEAR", year, v[period]);
        salaryByYear = v[period].amount;

        return salaryByYear;
      }

      const lastV = v[v.length - 1];
      if (year >= lastV.from) {
        salaryByYear = lastV.amount;

        return salaryByYear;
      }
    }
  }

  return salaryByYear;
};

export const getTotalBalance = (years: number) => {
  years = years <= 0 ? MIN_YEARS : years > MAX_YEARS ? MAX_YEARS : years;

  let total = 0;
  let yearExpenses = 0;
  // console.log("INSIDE GET_TOTAL_BALANCE");

  // fill accArr
  const accExpensArr: Array<{
    spent: number;
    records: Array<{ spent: number }> | [];
  }> = categories.map((cat: Category) => ({
    spent: cat.budget,
    records:
      cat.records === null
        ? []
        : cat.records.map((record: Record) => ({ spent: record.amount })),
  }));

  for (let year = 1; year <= years; year++) {
    // 1. const allCatExpenses = iterate over Categories
    // Calculate total expenses of all categories over 1 year and store those values in accArr for next years calculations
    console.log(`YEAR ${year}`);
    yearExpenses = categories.reduce(
      (prev: number, crr: Category, i: number) => {
        if (crr.records === null) {
          // console.log(`NO RECORDS ${crr.title}`);

          crr.budget = convertToUSD(crr.currency, crr.budget);

          if (!crr.inflType || crr.type === "income") {
            const crrYearSpent =
              crr.budget *
              getFrequency(crr.frequency) *
              (crr.type === "income" ? -1 : 1);
            // console.log(`Current year spent for ${crr.title}: ${crrYearSpent}`);

            return prev + crrYearSpent;
          }
          if (crr.type === "outcome") {
            const crrYearSpent =
              accExpensArr[i].spent *
              (year === 1 ? getFrequency(crr.frequency) : 1) *
              (1 + getRate(crr.inflVal));
            // console.log("PREVIOUS SPENT", accExpensArr[i].spent);
            // console.log(
            //   "FRECUENCY",
            //   year === 1 ? getFrequency(crr.frequency) : 1
            // );
            accExpensArr[i].spent = crrYearSpent;
            // console.log(`Current year spent for ${crr.title}: ${crrYearSpent}`);

            return prev + crrYearSpent;
          }
        } else {
          // console.log(`RECORDS ${crr.title}`);
          const yearCatExpenses = crr.records.reduce(
            (prevRec: number, crrRec: Record, crrRecI: number) => {
              // we wanna make sure all records are coverted to USD
              crrRec.amount = convertToUSD(crrRec.currency, crrRec.amount);
              if (
                !crr.inflType ||
                (crr.type === "perRec" && crrRec.type === "income")
              ) {
                const typeMod =
                  crr.type === "income" || crr.type === "perRec" ? -1 : 1;
                const crrYearSpent =
                  crrRec.amount * getFrequency(crrRec.frequency) * typeMod;
                // console.log(
                //   `Current year spent for ${crrRec.title}: ${crrYearSpent}`
                // );

                return prevRec + crrYearSpent;
              }
              if (crrRec.type === "outcome") {
                const crrYearSpent =
                  accExpensArr[i].records[crrRecI].spent *
                  (year === 1 ? getFrequency(crrRec.frequency) : 1) *
                  (1 +
                    (crr.inflType === "perRec"
                      ? getRate(crrRec.inflation)
                      : getRate(crr.inflVal)));
                // console.log(
                //   `Current year spent for ${crrRec.title}: ${crrYearSpent}`
                // );
                // console.log(
                //   "PREVIOUS SPENT",
                //   accExpensArr[i].records[crrRecI].spent
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
                accExpensArr[i].records[crrRecI].spent = crrYearSpent;

                return prevRec + crrYearSpent;
              }
              return prevRec + 0;
            },
            0
          );

          // console.log(`${crr.title} expenses: `, yearCatExpenses);

          return prev + yearCatExpenses;
        }
        return prev + 0;
      },
      0
    );
    console.log(`Expenses for year ${year}`, yearExpenses);

    const yearSalary =
      (salary.variance ? getSalaryByYear(year) : salary.amount) * 12;
    console.log(`SALARY AT YEAR ${year}: ${yearSalary}`);

    const yearBalance = yearSalary - yearExpenses;
    console.log(`YEAR BALANCE AT YEAR ${year}: ${yearBalance}`);

    const moneyReadyToInvest = yearBalance * getRate(user.investPerc);
    console.log("MONEY READY TO INVEST: ", moneyReadyToInvest);

    console.log("PREVIOUS TOTAL", total);
    total = (total + moneyReadyToInvest) * (1 + getRate(user.indexReturn));
    console.log("NEW TOTAL", total);
  }

  return total;
};

// const UserConfig = () => {
//   const form = useForm<ProfileDataInputType>({
//     resolver: zodResolver(profileData),
//     reValidateMode: "onChange",
//   });
//   const { register } = form;
//   const updateProfileData = trpc.user.updateProfile.useMutation();
//   const onSubmit = (data: ProfileDataInputType) => {
//     console.log("USER UPDATE DATA", data);
//     // updateProfileData.mutate(data);
//   };
//
//   return (
//     <>
//       <h2 className="text-2xl text-black">User settings</h2>
//       {/*country, inflation, currency, investPerc, indexReturn*/}
//
//     </>
//   );
// };

export default function Simulation() {
  const yearsEl = useRef<HTMLInputElement>(null);
  const [balance, setBalance] = useState<number>(salary.amount);

  return (
    // categories grid
    <>
      <Head>
        <title>Simulation | Budgetist</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Shell
        heading="Current balance"
        subtitle="As of 12/11/2022"
        CTA={
          balance ? (
            <div className="text-3xl text-black">{Math.round(balance)}</div>
          ) : null
        }
      >
        <div className="mb-6 grid gap-6 overflow-y-scroll lg:grid-cols-2">
          {categories.map((cat: Category) => {
            return (
              <div
                className="rounded-md border border-gray-500 p-5 shadow-sm"
                key={cat.title}
              >
                <div className="mb-4">
                  <div className="mb-2 flex justify-between border-b border-b-black">
                    <h2 className="mb-2 text-xl text-black">{cat.title}</h2>
                    <p className="text-xl text-black">
                      {cat.budget} {cat.currency}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p>Category type: {cat.type}</p>
                    <p>Type of inflation: {`${cat.inflType}`}</p>
                    <p>Country: {cat.country}</p>
                    <p>Inflation value: {cat.inflVal}</p>
                    <p>Color: {cat.color}</p>
                    <p>Icon: {cat.icon}</p>
                    <p>Frequency: {cat.frequency}</p>
                  </div>
                </div>

                <>
                  {cat.records && <h2 className="mb-2 text-xl">Records</h2>}
                  <div className="grid grid-cols-2 gap-2">
                    {cat.records?.map((record: Record) => {
                      return (
                        <div
                          className="rounded-sm border border-gray-500 p-2"
                          key={record.title}
                        >
                          <div className="flex justify-between">
                            <h4 className="mb-1 text-lg text-black">
                              {record.title.toLowerCase().toUpperCase()}
                            </h4>
                            <p className="text-lg text-black">
                              {record.amount} {record.currency}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <p>Frequency: {record.frequency}</p>
                            <p>Inflation: {record.inflation}</p>
                            <p>Type: {record.type}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              </div>
            );
          })}
        </div>
        {/* calculate button */}
        <div className="flex justify-start">
          <Input
            id="years"
            name="years"
            required
            type="number"
            ref={yearsEl}
            className="w-auto rounded-r-none"
          />
          <Button
            onClick={() => {
              setBalance(getTotalBalance(Number(yearsEl?.current?.value)));
            }}
            className="rounded-l-none py-2 px-4"
          >
            Run
          </Button>
        </div>
      </Shell>
    </>
  );
}
