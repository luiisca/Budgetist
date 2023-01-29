import showToast from "components/ui/core/notifications";
import {
  BalanceContext,
  BalanceInitStateType,
  RatesResultType,
  UserResultType,
} from "pages/simulation";
import { useContext, useEffect } from "react";

export const useSimData = (): {
  state: BalanceInitStateType;
  userResult: UserResultType;
  balanceDispatch: React.Dispatch<any>;
  ratesResult: RatesResultType;
  runSim: (exchangeRates: Record<string, number>) => void;
} => {
  const {
    state,
    userResult,
    categoriesResult: { data: categories },
    salariesResult: { data: salaries },
    ratesResult,
    dispatch: balanceDispatch,
  } = useContext(BalanceContext);
  const { data: user } = userResult;

  useEffect(() => {
    if (user && user.currency) {
      balanceDispatch({
        type: "NEW_CURRENCY",
        code: user.currency,
      });
    }
  }, [user?.currency]);

  const runSim = (exchangeRates: Record<string, number>) => {
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
      console.log("updated hook about to run sim");
      balanceDispatch({
        type: "SIM_RUN",
        payload: {
          categories,
          salaries,
          years: Number(state.years),
          investPerc: user.investPerc,
          indexReturn: user.indexReturn,
          exchangeRates,
        },
      });
    }
  };

  useEffect(() => {
    console.log("did it update??");
    if (ratesResult.data) {
      runSim(JSON.parse(ratesResult.data.rates));
    }
  }, [
    categories,
    salaries,
    user,
    state.years,
    balanceDispatch,
    ratesResult.data?.rates,
  ]);

  return {
    state,
    userResult,
    balanceDispatch,
    ratesResult,
    runSim,
  };
};
