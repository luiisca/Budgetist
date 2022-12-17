import {
  Button,
  Form,
  Input,
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
import { getTotalBalance } from "utils/simulation";
import showToast from "components/ui/core/notifications";
import { useForm } from "react-hook-form";
import { MAX_YEARS, MIN_YEARS } from "utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { runSimulationData, RunSimulationDataType } from "prisma/*";
import Switch from "components/ui/core/Switch";

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
  const yearsEl = useRef<HTMLInputElement>(null);
  const [balance, setBalance] = useState<number | null>(null);

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
          balance ? (
            <div className="text-3xl text-black">{Math.round(balance)}</div>
          ) : null
        }
      >
        <div className="flex flex-col space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-medium">Run Simulation</h2>
            <RunSimForm setBalance={setBalance} />
          </div>
          <div>
            <BalanceHistory />
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
  setBalance,
}: {
  setBalance: Dispatch<React.SetStateAction<number | null>>;
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
        setBalance(
          getTotalBalance({
            categories,
            salary: salary,
            years: Number(values.years),
            investPerc: user.investPerc,
            indexReturn: user.indexReturn,
          })
        );
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

const BalanceHistory = () => {
  const [hidden, setHidden] = useState(false);

  return (
    <>
      <div className="mb-4 flex items-center space-x-2">
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
      </div>
    </>
  );
};
