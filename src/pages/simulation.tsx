import {
  Button,
  Form,
  NumberInput,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  transIntoInt,
} from "components/ui";
import Head from "next/head";
import Shell from "components/ui/core/Shell";
import { AppRouterTypes, trpc } from "utils/trpc";
import _ from "lodash";
import Salaries from "components/simulation/salaries";
import Categories from "components/simulation/categories";
import {
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import {
  CategoriesType,
  getTotalBalance,
  Salary,
  YearBalanceType,
} from "utils/simulation";
import showToast from "components/ui/core/notifications";
import { useForm } from "react-hook-form";
import {
  CURRENCY_CODES,
  MAX_YEARS,
  MAYOR_CURRENCY_CODES,
  MIN_YEARS,
} from "utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { runSimulationData, RunSimulationDataType } from "prisma/*";
import { formatAmount, getCurrency } from "utils/sim-settings";
import { TitleWithInfo } from "components/simulation/components";
import React from "react";
import BalanceHistory from "components/simulation/balanceHistory";
import { UseTRPCQueryResult } from "@trpc/react/shared";
import { TRPCClientErrorLike } from "@trpc/client";
import { Procedure } from "@trpc/server";
import classNames from "classnames";
import { useSimData } from "components/simulation/hooks";
import Dropdown, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/Dropdown";
import { FiCheck, FiEdit } from "react-icons/fi";

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="mt-6 mb-8 space-y-6">
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

export type UserResultType = UseTRPCQueryResult<
  AppRouterTypes["user"]["me"]["output"],
  TRPCClientErrorLike<Procedure<"query", any>>
>;
type SalariesResultType = UseTRPCQueryResult<
  AppRouterTypes["simulation"]["salaries"]["get"]["output"],
  TRPCClientErrorLike<Procedure<"query", any>>
>;
type CategoriesResultType = UseTRPCQueryResult<
  AppRouterTypes["simulation"]["categories"]["get"]["output"],
  TRPCClientErrorLike<Procedure<"query", any>>
>;
export type RatesResultType = UseTRPCQueryResult<
  AppRouterTypes["simulation"]["getExchangeRates"]["output"],
  TRPCClientErrorLike<Procedure<"query", any>>
>;

const createCtx = <StateType, ActionType>(
  reducer: React.Reducer<StateType, ActionType>,
  initialState: StateType
) => {
  const defaultDispatch: React.Dispatch<ActionType> = () => initialState;
  const ctx = React.createContext({
    state: initialState,
    dispatch: defaultDispatch,
    userResult: {} as UserResultType,
    salariesResult: {} as SalariesResultType,
    categoriesResult: {} as CategoriesResultType,
    ratesResult: {} as RatesResultType,
  });

  const Provider = (props: PropsWithChildren) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const userResult = trpc.user.me.useQuery();
    const salariesResult = trpc.simulation.salaries.get.useQuery();
    const categoriesResult = trpc.simulation.categories.get.useQuery();
    const ratesResult = trpc.simulation.getExchangeRates.useQuery(
      userResult.data?.currency as string,
      {
        enabled: !!userResult.data?.currency,
      }
    );
    const utils = trpc.useContext();
    useEffect(() => {
      MAYOR_CURRENCY_CODES.forEach((code) => {
        console.log("prefetching for", code);
        utils.simulation.getExchangeRates.prefetch(code);
      });
    }, []);

    return (
      <ctx.Provider
        value={{
          state,
          dispatch,
          userResult,
          salariesResult,
          categoriesResult,
          ratesResult,
        }}
        {...props}
      />
    );
  };

  return [ctx, Provider] as const;
};

export type BalanceInitStateType = {
  years: number;
  totalBalanceLoading: boolean;
  totalBalance: number;
  balanceHistory: YearBalanceType[] | [];
  selCurrency: string | null;
};

export type SimRunPayloadType = {
  categories: CategoriesType;
  salaries: Salary[];
  years: number;
  investPerc: number;
  indexReturn: number;
  exchangeRates: Record<string, number>;
};
type ActionType =
  | {
      type: "SIM_RUN";
      payload: SimRunPayloadType;
    }
  | {
      type: "YEARS_UPDATED";
      years: number;
    }
  | {
      type: "TOTAL_BAL_LOADING";
      loading: boolean;
    }
  | {
      type: "NEW_CURRENCY";
      code: string;
    };

const balanceReducer = (state: BalanceInitStateType, action: ActionType) => {
  switch (action.type) {
    case "SIM_RUN": {
      const { total: totalBalance, balanceHistory } = getTotalBalance(
        action.payload
      );
      return {
        ...state,
        totalBalance,
        balanceHistory,
      };
    }
    case "YEARS_UPDATED": {
      return {
        ...state,
        years: action.years,
      };
    }
    case "TOTAL_BAL_LOADING": {
      return {
        ...state,
        totalBalanceLoading: action.loading,
      };
    }
    case "NEW_CURRENCY": {
      return {
        ...state,
        selCurrency: action.code,
      };
    }

    default: {
      return balanceInitState;
    }
  }
};

const balanceInitState: BalanceInitStateType = {
  years: 1,
  totalBalanceLoading: false,
  totalBalance: 0,
  balanceHistory: [],
  selCurrency: null,
};

const [ctx, BalanceProvider] = createCtx(balanceReducer, balanceInitState);
export const BalanceContext = ctx;

const RunSimForm = () => {
  const {
    userResult: { data: user, isLoading: userLoading },
    categoriesResult: { data: categories },
    salariesResult: { data: salaries },
    dispatch: balanceDispatch,
  } = useContext(BalanceContext);

  const ratesResult = trpc.simulation.getExchangeRates.useQuery(
    user?.currency as string,
    {
      enabled: !!user?.currency,
    }
  );

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
                : noCategories
                ? "one category"
                : "one salary"
            } first`,
            "error"
          );

          return;
        }
        if (ratesResult) {
          if (ratesResult.isError) {
            showToast(ratesResult.error.message, "error");
            return;
          }
          if (ratesResult.data) {
            balanceDispatch({
              type: "YEARS_UPDATED",
              years: Number(values.years),
            });
            balanceDispatch({
              type: "SIM_RUN",
              payload: {
                categories,
                salaries,
                years: Number(values.years),
                investPerc: user.investPerc,
                indexReturn: user.indexReturn,
                exchangeRates: JSON.parse(ratesResult.data.rates),
              },
            });
          }
        }
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
      <Button
        type="submit"
        className="self-end rounded-l-none py-2 px-4"
        loading={ratesResult.isLoading}
      >
        Run
      </Button>
    </Form>
  );
};

const Simulation = () => {
  const mutateReqSent = useRef(false);
  const seedExchangeRatesMutation =
    trpc.external.seedExchangeRates.useMutation();

  useEffect(() => {
    !mutateReqSent.current && seedExchangeRatesMutation.mutate();
    mutateReqSent.current = true;
  }, []);

  return (
    <>
      <Head>
        <title>Simulation | Budgetist</title>
        <meta
          name="description"
          content="simulate your total balance after x years"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Shell
        heading="Current balance"
        subtitle="As of 12/11/2022"
        CTA={<TotalBalance />}
      >
        <div className="flex flex-col space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-medium">Run Simulation</h2>
            <RunSimForm />
          </div>
          <div>
            <BalanceHistory />
          </div>
          <div>
            <h2 className="mb-4 text-lg font-medium">Salaries</h2>
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
};

const TotalBalance = () => {
  const {
    state: { totalBalance, totalBalanceLoading, balanceHistory, selCurrency },
    ratesResult: { data: ratesData },
    runSim,
    balanceDispatch,
  } = useSimData();
  const utils = trpc.useContext();

  if (totalBalance && selCurrency) {
    return (
      <Dropdown>
        <DropdownMenuTrigger
          className={classNames(
            "sm:left-2 sm:bottom-2",
            "fixed z-40 !rounded-lg px-3 py-2 md:left-auto md:bottom-auto md:right-5 md:top-2 ",
            "!bg-gray-50 ring-1 ring-gray-100",
            "dark:!bg-dark-secondary dark:shadow-darkBorder dark:ring-dark-400 dark:ring-offset-dark-primary dark:focus-visible:ring-dark-accent-200",
            totalBalanceLoading && "animate-pulse"
          )}
        >
          <TitleWithInfo
            Title={() => (
              <div className="ml-2 text-3xl text-black dark:text-dark-neutral">
                {formatAmount(totalBalance, selCurrency)}
              </div>
            )}
            infoCont={
              <div className="text-md px-3 py-2">
                Your total balance after{" "}
                {balanceHistory.length === 1 ? "one" : balanceHistory.length}
                {balanceHistory.length === 1 ? " year" : " years"} based <br />
                on salary variations, expenses, incomes, and yearly investments{" "}
                <br />
                on an index fund.
              </div>
            }
            className="flex-row-reverse "
            infoIconClassName="!h-4 !w-4 dark:!text-dark-neutral"
            tooltipSide="bottom"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="h-[35vh] min-h-60 overflow-y-scroll sm:ml-2 sm:mb-2"
        >
          {ratesData ? (
            CURRENCY_CODES.map((code) => {
              const currency = getCurrency(code);

              return (
                <DropdownMenuItem
                  onSelect={async () => {
                    balanceDispatch({
                      type: "TOTAL_BAL_LOADING",
                      loading: true,
                    });
                    const { rates } =
                      await utils.simulation.getExchangeRates.fetch(
                        currency.value
                      );
                    runSim(JSON.parse(rates));
                    balanceDispatch({
                      type: "NEW_CURRENCY",
                      code,
                    });
                    balanceDispatch({
                      type: "TOTAL_BAL_LOADING",
                      loading: false,
                    });
                  }}
                  className={classNames(
                    "flex cursor-pointer items-center px-4 py-2",
                    // @TODO: refactor these as part DropdownMenuItem default styling
                    selCurrency === code
                      ? "!bg-neutral-900 !text-white hover:!bg-neutral-900 dark:!bg-dark-accent-100 dark:!text-dark-neutral dark:hover:!bg-dark-accent-100"
                      : "dark:hover:!bg-dark-400"
                  )}
                >
                  {currency.label}
                </DropdownMenuItem>
              );
            })
          ) : (
            <div>No rates available yet</div>
          )}
        </DropdownMenuContent>
      </Dropdown>
    );
  } else {
    return null;
  }
};

export default function App() {
  return (
    <BalanceProvider>
      <Simulation />
    </BalanceProvider>
  );
}
