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
import _ from "lodash";
import SalaryForm from "components/simulation/salaryForm";
import Categories from "components/simulation/categories";
import { Dispatch, useRef, useState } from "react";
import { CatsAccExpType, getTotalBalance } from "utils/simulation";
import showToast from "components/ui/core/notifications";
import { useForm } from "react-hook-form";
import { MAX_YEARS, MIN_YEARS } from "utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { runSimulationData, RunSimulationDataType } from "prisma/*";
import Switch from "components/ui/core/Switch";
import EmptyScreen from "components/ui/core/EmptyScreen";
import { FiClock } from "react-icons/fi";
import { ListItem } from "components/ui/ListItem";
import { formatAmount } from "utils/sim-settings";

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
  const [balanceHistory, setBalanceHistory] = useState<CatsAccExpType[] | []>(
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
            <div className="text-3xl text-black">
              {formatAmount(totalBalance)}
            </div>
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
            <SalaryForm />
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
  setBalanceHistory: Dispatch<React.SetStateAction<CatsAccExpType[] | []>>;
}) => {
  const { data: user, isLoading: userLoading } = trpc.user.me.useQuery();
  const { data: salary } = trpc.simulation.salary.get.useQuery();
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
        if (!categories || !salary) {
          showToast(
            `Please add at least one ${
              !categories ? "category" : "salary"
            } first`,
            "error"
          );

          return;
        }
        const { total, balanceHistory } = getTotalBalance({
          categories,
          salary: salary,
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

const BalanceHistory = ({
  balanceHistory,
}: {
  balanceHistory: CatsAccExpType[] | [];
}) => {
  const [hidden, setHidden] = useState(false);
  const [animationParentRef] = useAutoAnimate<HTMLDivElement>();
  const [ulAnimationParentRef] = useAutoAnimate<HTMLUListElement>();

  return (
    <>
      <div className="mb-4 flex flex-col space-y-4" ref={animationParentRef}>
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium">Balance History</h2>
          <Tooltip content={`${hidden ? "Enable" : "Disable"} balance history`}>
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
          <>{console.log("BALANCE HISTORY", balanceHistory)}</>
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
              <div className="mb-16 overflow-hidden rounded-md border border-gray-200 bg-white">
                <ul
                  className="divide-y divide-neutral-200"
                  data-testid="schedules"
                  ref={ulAnimationParentRef}
                >
                  {balanceHistory[0].map((category, index) => {
                    if (category.records.length > 0) {
                      return category.records.map((record, index) => (
                        <ListItem
                          key={index}
                          category={{
                            ...record,
                            spent: formatAmount(record.spent),
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
                          spent: formatAmount(category.spent),
                        }}
                      />
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
