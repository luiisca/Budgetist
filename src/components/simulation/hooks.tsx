import { BalanceContext, UserResultType } from "pages/simulation";
import { useContext, useEffect } from "react";

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

  useEffect(() => {
    if (
      categories &&
      categories.length > 0 &&
      salaries &&
      salaries.length > 0 &&
      user
    ) {
      balanceDispatch({
        type: "TOTAL_BAL_LOADING",
        loading: false,
      });
      balanceDispatch({
        type: "SIM_RUN",
        payload: {
          categories,
          salaries,
          years: Number(years),
          investPerc: user.investPerc,
          indexReturn: user.indexReturn,
        },
      });
    }
  }, [categories, salaries, user, years, balanceDispatch]);

  return {
    userResult,
    balanceDispatch,
  };
};
