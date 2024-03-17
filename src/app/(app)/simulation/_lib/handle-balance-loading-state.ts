import type { ActionType } from './context';

type PropActionType =
    | {
        type: 'ON_MUTATE'
    }
    | {
        type: 'ON_SUCCESS',
        years: number,
    }
    | {
        type: 'ON_ERROR',
    }

export default function handleBalanceLoadingState({
    shouldRunSim,
    balanceDispatch,
    action,
}: {
    shouldRunSim: boolean | undefined;
    balanceDispatch: React.Dispatch<ActionType>
    action: PropActionType,
}) {
    switch (action?.type) {
        case 'ON_MUTATE': {
            if (shouldRunSim) {
                balanceDispatch({
                    type: "TOTAL_BAL_LOADING",
                    totalBalanceLoading: true,
                });
            } else {
                balanceDispatch({
                    type: "TOTAL_BAL_SET_HIDDEN",
                    totalBalanceHidden: true,
                })
            }

            break;
        }
        case 'ON_SUCCESS': {
            if (shouldRunSim) {
                balanceDispatch({
                    type: "SIM_RUN",
                    years: action.years,
                })
            } else {
                balanceDispatch({
                    type: "TOTAL_BAL_SET_HIDDEN",
                    totalBalanceHidden: true,
                })
            }

            break;
        }
        case 'ON_ERROR': {
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: false,
            });

            if (!shouldRunSim) {
                balanceDispatch({
                    type: "TOTAL_BAL_SET_HIDDEN",
                    totalBalanceHidden: true,
                })
            }

            break;
        }
    }
}
