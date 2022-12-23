import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  Button,
  Form,
  NumberInput,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  Tooltip,
  transIntoInt,
} from "components/ui";
import Head from "next/head";
import Shell from "components/ui/core/Shell";
import { trpc } from "utils/trpc";
import _, { capitalize } from "lodash";
import Salaries from "components/simulation/salaries";
import Categories from "components/simulation/categories";
import { Dispatch, useState } from "react";
import { getTotalBalance, YearBalanceType } from "utils/simulation";
import showToast from "components/ui/core/notifications";
import { useForm } from "react-hook-form";
import { MAX_YEARS, MIN_YEARS } from "utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { runSimulationData, RunSimulationDataType } from "prisma/*";
import Switch from "components/ui/core/Switch";
import EmptyScreen from "components/ui/core/EmptyScreen";
import { FiChevronDown, FiClock } from "react-icons/fi";
import { ListItem } from "components/ui/ListItem";
import { formatAmount } from "utils/sim-settings";
import classNames from "classnames";
import { TitleWithInfo } from "components/simulation/components";
import Dropdown, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/Dropdown";

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="mt-6 mb-8 space-y-6 divide-y">
        <SkeletonText className="h-8 w-full" />
        <div className="flex space-x-3">
          <SkeletonText className="h-8 w-full flex-[1_1_80%]" />
          <SkeletonText className="h-8 w-full" />
        </div>
        <SkeletonText className="h-8 w-full" />

        <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
      </div>
    </SkeletonContainer>
  );
};

export default function Simulation() {
  const [totalBalance, setTotalBalance] = useState<number | null>(null);
  const [balanceHistory, setBalanceHistory] = useState<YearBalanceType[] | []>(
    []
  );

  return (
    <>
      <Head>
        <title>Simulation | Budgetist</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Shell
        heading="Current balance"
        subtitle="As of 12/11/2022"
        CTA={
          totalBalance ? (
            <TitleWithInfo
              Title={() => (
                <div className="ml-2 text-3xl text-black">
                  {formatAmount(totalBalance)}
                </div>
              )}
              infoCont={
                <div className="text-md px-3 py-2">
                  Your total balance after{" "}
                  {balanceHistory.length === 1 ? "one" : balanceHistory.length}
                  {balanceHistory.length === 1 ? " year" : " years"} based{" "}
                  <br />
                  on salary variations, expenses, incomes, and yearly
                  investments <br />
                  on an index fund.
                </div>
              }
              infoIconClassName="!h-4 !w-4"
              className="flex-row-reverse"
            />
          ) : null
        }
      >
        <div className="flex flex-col space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-medium">Run Simulation</h2>
            <RunSimForm
              setTotalBalance={setTotalBalance}
              setBalanceHistory={setBalanceHistory}
            />
          </div>
          <div>
            <BalanceHistory balanceHistory={balanceHistory} />
          </div>
          <div>
            <h2 className="mb-4 text-lg font-medium">Salary</h2>
            <Salaries />
          </div>

          <div>
            <h2 className="mb-4 text-lg font-medium">Categories</h2>
            <Categories />
          </div>
        </div>
      </Shell>
    </>
  );
}

const RunSimForm = ({
  setTotalBalance,
  setBalanceHistory,
}: {
  setTotalBalance: Dispatch<React.SetStateAction<number | null>>;
  setBalanceHistory: Dispatch<React.SetStateAction<YearBalanceType[] | []>>;
}) => {
  const { data: user, isLoading: userLoading } = trpc.user.me.useQuery();
  const { data: salaries } = trpc.simulation.salaries.get.useQuery();
  const { data: categories } = trpc.simulation.categories.get.useQuery();

  const runSimForm = useForm<RunSimulationDataType>({
    resolver: zodResolver(runSimulationData),
    defaultValues: {
      years: MIN_YEARS,
    },
  });
  const { control } = runSimForm;

  if (!user || userLoading) {
    return <SkeletonLoader />;
  }

  return (
    <Form
      form={runSimForm}
      handleSubmit={(values: RunSimulationDataType) => {
        const noCategories = !categories || categories.length === 0;
        const noSalaries = !salaries || salaries.length === 0;

        if (noCategories || noSalaries) {
          showToast(
            `Please add at least ${
              noCategories && noSalaries
                ? "some category or salary"
                : "one " + !categories
                ? "category"
                : "salary"
            } first`,
            "error"
          );

          return;
        }
        const { total, balanceHistory } = getTotalBalance({
          categories,
          salaries,
          years: Number(values.years),
          investPerc: user.investPerc,
          indexReturn: user.indexReturn,
        });
        setTotalBalance(total);
        setBalanceHistory(balanceHistory);
      }}
      className="my-6 flex justify-start"
    >
      <NumberInput
        label="Years"
        control={control}
        name="years"
        className="mb-0 w-auto rounded-r-none"
        onChange={(e) => {
          const years = e.target.value;
          const parsedYears = transIntoInt(years);

          if (parsedYears > MAX_YEARS) return MAX_YEARS;

          return parsedYears;
        }}
      />
      <Button type="submit" className="self-end rounded-l-none py-2 px-4">
        Run
      </Button>
    </Form>
  );
};

const typeOptions = ["all", "income", "outcome", "salary"];

const BalanceHistory = ({
  balanceHistory,
}: {
  balanceHistory: YearBalanceType[];
}) => {
  const [hidden, setHidden] = useState(false);
  const [year, setYear] = useState(1);
  const [typeFilterValue, setTypeFilterValue] = useState(typeOptions[0]);
  const [animationParentRef] = useAutoAnimate<HTMLDivElement>();
  const [ulAnimationParentRef] = useAutoAnimate<HTMLUListElement>();

  const { control } = useForm();

  return (
    <>
      <div className="mb-4 flex flex-col space-y-4" ref={animationParentRef}>
        <div className="flex items-center space-x-2">
          <TitleWithInfo
            Title={() => <h2 className="text-lg font-medium">Balance</h2>}
            infoCont={
              <>
                It gives you a clear picture of how much <br />
                you would have spent in <br />
                each category for the inputted year. <br />
              </>
            }
          />
          <Tooltip content={`${hidden ? "Enable" : "Disable"} balance`}>
            <div className="self-center rounded-md p-2 hover:bg-gray-200">
              <Switch
                name="Hidden"
                checked={!hidden}
                onCheckedChange={() => {
                  setHidden(!hidden);
                }}
              />
            </div>
          </Tooltip>
        </div>
        {!hidden && (
          <>
            {balanceHistory.length === 0 ? (
              <div className="flex justify-center">
                <EmptyScreen
                  Icon={FiClock}
                  headline="Run Simulation"
                  description="Before viewing your expenses and incomes, run the simulation to see them reflected in this area."
                />
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4 self-end">
                  <Dropdown>
                    <DropdownMenuTrigger asChild className="px-4">
                      <Button
                        type="button"
                        size="icon"
                        color="secondary"
                        EndIcon={() => (
                          <FiChevronDown className="ml-1 -mb-[2px]" />
                        )}
                        className="w-28"
                      >
                        {typeFilterValue}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {typeOptions.map((type) => {
                        const capType = capitalize(type);

                        return (
                          <DropdownMenuItem>
                            <Button
                              onClick={() => {
                                setTypeFilterValue(capType);
                              }}
                              type="button"
                              color="minimal"
                              className="w-full font-normal"
                            >
                              {capType}
                            </Button>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </Dropdown>

                  <form>
                    <NumberInput
                      control={control}
                      defaultValue={year}
                      name="year"
                      onChange={(e) => {
                        const balanceYears = balanceHistory.length;
                        let parsedYear = transIntoInt(e.target.value);

                        if (parsedYear > balanceYears) {
                          parsedYear = balanceYears;
                        }

                        setYear(parsedYear as unknown as number);
                        return parsedYear;
                      }}
                      className="!mb-0 !w-32"
                      placeholder="Year balance"
                    />
                  </form>
                </div>
                <div
                  className={classNames(
                    "mb-16 overflow-hidden rounded-md border border-transparent bg-white",
                    balanceHistory[year - 1] && "!border-gray-200"
                  )}
                >
                  <ul
                    className="divide-y divide-neutral-200"
                    data-testid="schedules"
                    ref={ulAnimationParentRef}
                  >
                    {(typeFilterValue === "salary" ||
                      typeFilterValue === "all") &&
                      balanceHistory[year - 1]?.salariesBalance.map(
                        (salary) => (
                          <ListItem
                            infoBubble={false}
                            category={{
                              ...salary,
                              spent: formatAmount(Math.abs(salary.amount)),
                            }}
                          />
                        )
                      )}
                    {typeFilterValue !== "salary" &&
                      balanceHistory[year - 1]?.categoriesBalance
                        .filter((category) => category.type === typeFilterValue)
                        .map((category, index) => {
                          if (category.records.length > 0) {
                            return category.records.map((record, index) => (
                              <ListItem
                                key={index}
                                category={{
                                  ...record,
                                  spent: formatAmount(Math.abs(record.spent)),
                                  parentTitle: category.title,
                                  record: true,
                                }}
                              />
                            ));
                          }
                          return (
                            <ListItem
                              key={index}
                              category={{
                                ...category,
                                spent: formatAmount(Math.abs(category.spent)),
                              }}
                            />
                          );
                        })}
                  </ul>
                </div>

                {year && (
                  <div className="mt-4 flex w-full justify-between px-3">
                    <p className="text-md text-green-400">
                      INCOME:{" "}
                      <span className="text-xl">
                        {formatAmount(
                          Math.abs(balanceHistory[year - 1]?.income)
                        )}
                      </span>
                    </p>
                    <p className="text-md text-red-400">
                      OUTCOME:{" "}
                      <span className="text-xl">
                        {formatAmount(
                          Math.abs(balanceHistory[year - 1]?.outcome)
                        )}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
