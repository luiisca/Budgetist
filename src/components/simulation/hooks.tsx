import showToast from "components/ui/core/notifications";
import { BalanceContext, UserResultType } from "pages/simulation";
import { useContext, useEffect, useRef, useState } from "react";
import { trpc } from "utils/trpc";

export const useSimData = (): {
  userResult: UserResultType;
  balanceDispatch: React.Dispatch<any>;
} => {
  const {
    state: { years },
    userResult,
    categoriesResult: { data: categories },
    salariesResult: { data: salaries },
    dispatch: balanceDispatch,
  } = useContext(BalanceContext);
  const { data: user } = userResult;

  const ratesResult = trpc.simulation.getExchangeRates.useQuery(
    user?.currency as string,
    {
      enabled: !!user?.currency,
    }
  );

  useEffect(() => {
    if (
      categories &&
      categories.length > 0 &&
      salaries &&
      salaries.length > 0 &&
      user &&
      ratesResult
    ) {
      balanceDispatch({
        type: "TOTAL_BAL_LOADING",
        loading: false,
      });
      if (ratesResult.isError) {
        showToast(ratesResult.error.message, "error");
        return;
      }
      if (ratesResult.data) {
        balanceDispatch({
          type: "SIM_RUN",
          payload: {
            categories,
            salaries,
            years: Number(years),
            investPerc: user.investPerc,
            indexReturn: user.indexReturn,
            exchangeRates: JSON.parse(ratesResult.data.rates),
          },
        });
      }
    }
  }, [
    categories,
    salaries,
    user,
    years,
    balanceDispatch,
    ratesResult.data?.rates,
  ]);

  return {
    userResult,
    balanceDispatch,
  };
};
