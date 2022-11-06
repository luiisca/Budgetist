import { Button, Input } from "components/ui";
import { useRef, useState } from "react";

type User = {
  country: string | "other";
  inflation: number;
  currency: string;
};
const user: User = {
  country: "usa",
  inflation: 8,
  currency: "USD",
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
        amount: 300,
        frequency: 1,
        inflation: 0,
        currency: user.currency,
      },
      {
        title: "english",
        amount: 300,
        frequency: 2,
        inflation: 0,
        currency: user.currency,
      },
      {
        title: "math",
        amount: 30,
        frequency: 1,
        inflation: 0,
        currency: user.currency,
      },
      {
        title: "coding",
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
    type: "outcome",
    inflType: "perCat",
    country: user.country,
    inflVal: 5,
    color: "pink",
    icon: "house",
    records: [
      {
        title: "window",
        amount: 300,
        frequency: 4,
        inflation: 4,
        currency: user.currency,
      },
      {
        title: "door",
        amount: 30,
        frequency: 1,
        inflation: user.inflation,
        currency: "PEN",
      },
      {
        title: "mouse",
        amount: 100,
        frequency: 1,
        inflation: 4,
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

export const getTotalExpenses = (years: number) => {
  return categories.reduce((prev: number, crr: Category, i: number) => {
    if (crr.records === null) {
      if (crr.currency !== "USD") {
        console.log("no USD currency set");
        console.log("converting to USD");
        // crr.budget = convertToUSD(budget)
      }
      if (!crr.inflType) {
        return (
          prev +
          crr.budget * crr.frequency * years * (crr.type === "income" ? -1 : 1)
        );
      }
      if (crr.inflType === "perCat" && crr.type === "outcome") {
        return (
          prev +
          getTotalAdjustedToInfl(
            crr.budget,
            crr.frequency,
            getRate(crr.inflVal),
            years
          )
        );
      }
    } else {
      return (
        prev +
        crr.records.reduce((prevRec: number, crrRec: Record, i: number) => {
          if (crrRec.currency !== "USD") {
            console.log("no USD currency set");
            console.log("converting to USD");
            // crrRec.amount = convertToUSD(crrRec.amount )
          }
          if (!crr.inflType) {
            const typeMod =
              crr.type === "income" ||
              (crr.type === "perRec" && crrRec.type === "income")
                ? -1
                : 1;
            return prevRec + crrRec.amount * crrRec.frequency * years * typeMod;
          }
          if (crr.inflType === "perCat") {
          }
          if (crr.inflType === "perRec") {
          }
          return 0;
        }, 0)
      );
    }
    return prev + 0;
  }, 0);
};

const getTotalMoney = (money, years, yoy) => {
  // compound interest formula
  // 1. Get how much user will have earned after 'years' taking variations into account
  // 2. Get difference between total earned money and total spent money
  // 3. Add up each years difference to compound formula
};

export default function Home() {
  const yearsEl = useRef<HTMLInputElement>(null);
  const [balance, setBalance] = useState<number | undefined>(undefined);

  return (
    // categories grid
    <div className="mx-auto flex h-screen max-w-screen-xl flex-col justify-center pt-2 ">
      <div className="mb-3 flex justify-between">
        <h1 className="text-3xl text-black ">Categories</h1>
        <div className="text-3xl text-black">{balance?.toFixed(2)}</div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-6 overflow-y-scroll">
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
            setBalance(getTotalExpenses(Number(yearsEl?.current?.value)));
          }}
          className="rounded-l-none py-2 px-4"
        >
          Run
        </Button>
      </div>
    </div>
  );
}
