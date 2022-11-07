import { Button, Input } from "components/ui";
import { useRef, useState } from "react";

type User = {
  country: string | "other";
  inflation: number;
  currency: string;
  investPerc: number;
};
const user: User = {
  country: "usa",
  inflation: 8,
  currency: "USD",
  investPerc: 75,
};

type Record = {
  title: string;
  amount: number;
  type: "income" | "outcome";

  frequency: number;
  inflation: number;
  currency: string;
};

// each category can have map their own country and inflVal but they will default to the user's one
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

type Salary = {
  title: string;
  currency: string;
  amount: number;
  variance:
    | Array<{
        from: number;
        to: number;
        amount: number;
      }>
    | false;
};

const salary: Salary = {
  title: "Salary",
  currency: user.currency,
  amount: 2000,
  variance: [
    {
      from: 1,
      to: 2,
      amount: 2000,
    },
    {
      from: 3,
      to: 5,
      amount: 4000,
    },
    {
      from: 6,
      to: 10,
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

// P => Principal, i => yearly interest, n => years
const getCoumpValue = (P: number, i: number, n: number) => P * (1 + i) ** n;
const getCoumpWithContrib = (P: number, i: number, n: number, m: number) =>
  P * Math.pow(1 + i, n) + m * ((Math.pow(1 + i, n) - 1) / i);

export const getTotalAdjustedToInfl = (
  startVal: number,
  frequency: number,
  infl: number,
  limit: number,
  calls: number = 1,
  total: number = 0
): number => {
  frequency = frequency < 1 ? 1 : frequency > 12 ? 12 : frequency;
  const newVal = startVal * (calls === 1 ? frequency : 1) * (1 + infl);

  if (calls >= limit) return total + newVal;

  return getTotalAdjustedToInfl(
    newVal,
    frequency,
    infl,
    limit,
    calls + 1,
    total + newVal
  );
};
const getRate = (x: number) => x / 100;
const getFrequency = (freq: number) => (freq < 1 ? 1 : freq > 12 ? 12 : freq);

export const getTotalBalance = (years: number) => {
  let total = 0;
  let yearsExpenses = 0;
  console.log("INSIDE GET_TOTAL_BALANCE");

  // fill accArr
  let accExpensArr: Array<{
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
    yearsExpenses = categories.reduce(
      (prev: number, crr: Category, i: number) => {
        if (crr.records === null) {
          console.log(`NO RECORDS ${crr.title}`);
          if (crr.currency !== "USD") {
            console.log("no USD currency set");
            console.log("converting to USD");
            // crr.budget = convertToUSD(budget)
          }
          if (!crr.inflType || crr.type === "income") {
            const crrYearSpent =
              crr.budget *
              getFrequency(crr.frequency) *
              (crr.type === "income" ? -1 : 1);
            console.log(`Current year spent for ${crr.title}: ${crrYearSpent}`);

            return prev + crrYearSpent;
          }
          if (crr.type === "outcome") {
            const crrYearSpent =
              accExpensArr[i].spent *
              (year === 1 ? getFrequency(crr.frequency) : 1) *
              (1 + getRate(crr.inflVal));
            console.log("PREVIOUS SPENT", accExpensArr[i].spent);
            console.log(
              "FRECUENCY",
              year === 1 ? getFrequency(crr.frequency) : 1
            );
            accExpensArr[i].spent = crrYearSpent;
            console.log(`Current year spent for ${crr.title}: ${crrYearSpent}`);

            return prev + crrYearSpent;
          }
        } else {
          console.log(`RECORDS ${crr.title}`);
          const yearCatExpenses = crr.records.reduce(
            (prevRec: number, crrRec: Record, crrRecI: number) => {
              // we wanna make sure all records are coverted to USD
              if (crrRec.currency !== "USD") {
                console.log("no USD currency set");
                console.log("converting to USD");
                // crrRec.amount = convertToUSD(crrRec.amount )
              }
              if (
                !crr.inflType ||
                (crr.type === "perRec" && crrRec.type === "income")
              ) {
                const typeMod =
                  crr.type === "income" || crr.type === "perRec" ? -1 : 1;
                const crrYearSpent =
                  crrRec.amount * getFrequency(crrRec.frequency) * typeMod;
                console.log(
                  `Current year spent for ${crrRec.title}: ${crrYearSpent}`
                );

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
                console.log(
                  `Current year spent for ${crrRec.title}: ${crrYearSpent}`
                );
                console.log(
                  "PREVIOUS SPENT",
                  accExpensArr[i].records[crrRecI].spent
                );
                console.log(
                  "FREQUENCY",
                  year === 1 ? getFrequency(crrRec.frequency) : 1
                );
                console.log(
                  "RATE",
                  1 + crr.inflType === "perRec"
                    ? getRate(crrRec.inflation)
                    : getRate(crr.inflVal)
                );
                accExpensArr[i].records[crrRecI].spent = crrYearSpent;

                return prevRec + crrYearSpent;
              }
              return prevRec + 0;
            },
            0
          );

          console.log(`${crr.title} expenses: `, yearCatExpenses);

          return prev + yearCatExpenses;
        }
        return prev + 0;
      },
      0
    );
    console.log(`Expenses for year ${year}`, yearsExpenses);
    // 2. add new calculated value after each year to variable
    // const yearBalance = (yearSalary - allCatExpenses) * percToInvest
    // 3. total += (year === 1 ? yearBalance : total) * indexRate
  }

  return yearsExpenses;
};

export default function Home() {
  const yearsEl = useRef<HTMLInputElement>(null);
  const [balance, setBalance] = useState<number | undefined>(undefined);

  return (
    // categories grid
    <div className="mx-auto flex h-screen max-w-screen-xl flex-col justify-center px-3 pt-2 ">
      <div className="mb-3 flex justify-between">
        <h1 className="text-3xl text-black ">Categories</h1>
        {balance && (
          <div className="text-3xl text-black">{Math.round(balance)}</div>
        )}
      </div>
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
    </div>
  );
}
