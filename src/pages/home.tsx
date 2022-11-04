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

type RecordInfl = {
  title: string;
  amount: number;

  frequency: number;
  inflation: number;
  currency: string;
};

// each category can have map their own country and inflVal but they will default to the user's one
type Category = {
  title: string;
  budget: number;
  currency: string | "perRec";
  type: "income" | "outcome";
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
  records: Array<RecordInfl> | [];
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
const categories: Array<Category> = [
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
    inflType: false,
    country: "pe",
    inflVal: 0,
    color: "red",
    icon: "medkit",
    records: [],
    frequency: 8,
  },
];
const getTotalExpenses = (years) => {
  // categories.reduce((prev, crr, i) => {}, 0);
};

const getTotalMoney = (money, years, yoy) => {
  // compound interest formula
};

export default function Home() {
  return <div>Welcome user!</div>;
}
