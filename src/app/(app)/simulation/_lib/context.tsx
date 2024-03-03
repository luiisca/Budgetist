'use client'

import { CreateReactUtilsProxy } from "@trpc/react-query/shared";
import { PropsWithChildren, createContext, useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import { YearBalanceType, getTotalBalance } from "~/lib/simulation";
import { api } from "~/lib/trpc/react";
import { RouterOutputs } from "~/lib/trpc/shared";
import { AppRouter } from "~/server/api/root";

export type TBalanceInitState = {
    years: number;
    totalBalanceLoading: boolean;
    totalBalance: number;
    balanceHistory: YearBalanceType[] | [];
};
type TBalanceReducerState = TBalanceInitState
export type ActionType =
    | {
        type: "SIM_RUN";
        years: number;
    }
    | {
        type: "BASE_SIM_RUN";
        payload: {
            years: number;
            categories: RouterOutputs['simulation']['categories']['get'];
            salaries: RouterOutputs['simulation']['salaries']['get'];
            user: RouterOutputs['user']['me'];
        }
    }
    | {
        type: "YEARS_UPDATED";
        years: number;
    }
    | {
        type: "TOTAL_BAL_LOADING";
        totalBalanceLoading: boolean;
    }

const createCtx = (
    reducer: React.Reducer<TBalanceReducerState, ActionType>,
    initialState: TBalanceInitState
) => {
    const defaultDispatch: React.Dispatch<ActionType> = () => initialState;
    const ctx = createContext({
        state: initialState,
        dispatch: defaultDispatch,
    });

    const Provider = (props: PropsWithChildren) => {
        const utils = api.useUtils();
        const [state, dispatch] = useReducer(reducer, {
            ...initialState,
        });
        const customDispatch = useCallback(async (action: ActionType) => {
            switch (action.type) {
                case "SIM_RUN": {
                    const categories = await utils.simulation.categories.get.fetch();
                    const salaries = await utils.simulation.salaries.get.fetch();
                    const user = await utils.user.me.fetch();

                    console.log('categories, salaries, user', categories, salaries, user)
                    // handle empty trpc data (i.e. when trpc query is still fetching and reducer state hasn't been synced with it by provider useEffect)
                    if (!categories || !salaries || !user) {
                        utils.user.me.invalidate()
                        utils.simulation.invalidate()
                        toast.error('Error fetching data. Retrying...', {
                            action: {
                                label: 'Retry',
                                onClick: () => {
                                    console.log('retrying onError ❌')
                                    dispatch({
                                        type: "BASE_SIM_RUN",
                                        payload: {
                                            categories,
                                            salaries,
                                            user,
                                            years: action.years
                                        }
                                    })
                                }
                            }
                        })

                        return;
                    }
                    // data is here but incomplete due to user
                    const noCategories = categories.length === 0
                    const noSalaries = salaries.length === 0
                    if (noCategories || noSalaries) {
                        toast.error(
                            `Please add at least ${noCategories && noSalaries
                                ? "some category or salary"
                                : noCategories
                                    ? "one category"
                                    : "one salary"
                            } first`,
                        );

                        return;
                    }

                    dispatch({
                        type: "BASE_SIM_RUN",
                        payload: {
                            categories,
                            salaries,
                            user,
                            years: action.years
                        }
                    })
                }

                default: {
                    dispatch(action)
                }
            }
        }, [])

        return (
            <ctx.Provider
                value={{
                    state,
                    dispatch: customDispatch,
                }}
                {...props}
            />
        );
    };

    return [ctx, Provider] as const;
};


const balanceReducer = (state: TBalanceReducerState, action: ActionType) => {
    switch (action.type) {
        case "BASE_SIM_RUN": {
            console.log('running SIM_RUN! 👟')
            const { categories, salaries, user, years } = action.payload

            // data is in the right shape to run simulation algo
            if (categories.length > 0 && salaries.length > 0 && user) {
                const { total: totalBalance, balanceHistory } = getTotalBalance({
                    categories,
                    salaries,
                    investPerc: user.investPerc,
                    indexReturn: user.indexReturn,
                    years: years
                });

                return {
                    ...state,
                    totalBalance,
                    balanceHistory,
                    totalBalanceLoading: false,
                };
            } else {
                return {
                    ...state
                }
            }
        }
        case "YEARS_UPDATED": {
            return {
                ...state,
                years: action.years,
            };
        }
        case "TOTAL_BAL_LOADING": {
            console.log('TOTAL_BAL_LOADING running')
            return {
                ...state,
                totalBalanceLoading: action.totalBalanceLoading,
            };
        }

        default: {
            return state;
        }
    }
};

const balanceInitState: TBalanceInitState = {
    years: 1,
    totalBalanceLoading: false,
    totalBalance: 0,
    balanceHistory: [],
};

const [ctx, BalanceProvider] = createCtx(balanceReducer, balanceInitState);
const BalanceContext = ctx;
export { BalanceContext, BalanceProvider }
