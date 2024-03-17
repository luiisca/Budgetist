'use client'

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChevronDown, CircleOff, Play } from "lucide-react";

import { cn } from "~/lib/cn";
import { formatAmount } from "~/lib/sim-settings";
import capitalize from "~/lib/capitalize";
import { BalanceContext } from "~/app/(app)/simulation/_lib/context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/core/dropdown-menu";
import { Button, InputField, Tooltip, transIntoInt } from "~/components/ui";
import Switch from "~/components/ui/core/switch";
import { YearBalanceType } from "~/lib/simulation";
import TitleWithInfo from "../title-with-info";
import { ListItem } from "./list-item";
import EmptyScreen from "~/components/ui/empty-screen";

const filters = ["all", "income", "outcome", "salary"] as const;
type TFilters = typeof filters[number];

function Filters({ yearState, crrFilterState }: {
    yearState: [number, React.Dispatch<React.SetStateAction<number>>];
    crrFilterState: [TFilters, React.Dispatch<React.SetStateAction<TFilters>>];
}) {
    const { state: { years } } = useContext(BalanceContext);
    const [year, setYear] = yearState;
    const [crrFilter, setCrrFilter] = crrFilterState;
    const dropdownMenuRef = useRef<null | HTMLDivElement>(null);

    return (
        <div className="flex items-center space-x-4 self-end">
            <DropdownMenu>
                <DropdownMenuTrigger asChild className="px-4">
                    <Button
                        type="button"
                        size="icon"
                        color="secondary"
                        EndIcon={() => (
                            <ChevronDown className="ml-1 -mb-[2px]" />
                        )}
                        className="w-28"
                    >
                        {capitalize(crrFilter)}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent ref={dropdownMenuRef}>
                    {filters.map((filter, index) => {
                        return (
                            <DropdownMenuItem
                                key={index}
                                onClick={() => {
                                    setCrrFilter(filter);
                                }}
                            >
                                <Button
                                    type="button"
                                    color="minimal"
                                    className={cn(
                                        "w-full font-normal",
                                        filter === crrFilter
                                            ? "!bg-neutral-900 !text-white hover:!bg-neutral-900 dark:!bg-brand dark:!text-dark-neutral dark:hover:!bg-brand"
                                            : "dark:hover:!bg-dark-400"
                                    )}
                                >
                                    {capitalize(filter)}
                                </Button>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuContent>
            </DropdownMenu>

            <InputField
                type="number"
                name="year"
                className="!mb-0 !w-32"
                placeholder="Year balance"
                onChange={(e) => {
                    let parsedYear = transIntoInt(e.target.value);
                    if (typeof parsedYear === 'string') return null

                    setYear(parsedYear > years ? years : parsedYear);
                }}
                defaultValue={year}
            />
        </div>
    )
}

function ListContainer() {
    const {
        state: { years, balanceHistory },
    } = useContext(BalanceContext);

    const yearState = useState(years);
    const [year] = yearState;

    const crrFilterState = useState(filters[0] as TFilters);
    const [crrFilter] = crrFilterState;

    const [ulAnimationParentRef] = useAutoAnimate<HTMLUListElement>();

    const [views, setViews] = useState<Record<typeof filters[number], JSX.Element[]>>()
    const incomeList = [] as JSX.Element[];
    const outcomeList = [] as JSX.Element[];

    const getSalariesList = useCallback(() => {
        return (balanceHistory[year - 1] as YearBalanceType).salariesBalance.map(
            (salary, index) => (
                <ListItem
                    key={index}
                    infoBubble={
                        <>
                            <p>Amount: </p>
                            <p>{formatAmount(salary.amountBefTax)}</p>
                            <p>Tax Perc: </p>
                            <p>{salary.taxPercent}%</p>
                        </>
                    }
                    category={{
                        ...salary,
                        spent: formatAmount(
                            Math.abs(salary.amountAftTax)
                        ),
                    }}
                />
            )
        )
    }, [])

    const getCategoriesList = useCallback(() => {
        return (balanceHistory[year - 1] as YearBalanceType).categoriesBalance.map(
            (category, index) => {
                if (category.records.length > 0) {
                    return category.records.map((record, index) => {
                        const markup = (
                            <ListItem
                                key={index}
                                infoBubble={
                                    <>
                                        <p>Inflation: </p>
                                        <p>
                                            {record.type === "outcome"
                                                ? record.inflation
                                                : 0}
                                            %
                                        </p>
                                        <p>Frequency: </p>
                                        <p>{record.frequency} / 12 </p>
                                    </>
                                }
                                category={{
                                    ...record,
                                    spent: formatAmount(
                                        Math.abs(record.spent)
                                    ),
                                    parentTitle: category.title,
                                    record: true,
                                }}
                            />
                        )
                        if (record.type === 'income') {
                            incomeList.push(markup)
                        }
                        if (record.type === 'outcome') {
                            outcomeList.push(markup)
                        }

                        return markup
                    })
                }

                const markup = (
                    <ListItem
                        key={index}
                        category={{
                            ...category,
                            spent: formatAmount(Math.abs(category.spent)),
                        }}
                    />
                );
                if (category.type === 'income') {
                    incomeList.push(markup)
                }
                if (category.type === 'outcome') {
                    outcomeList.push(markup)
                }

                return markup
            }
        )
    }, [])

    useEffect(() => {
        const salariesList = getSalariesList()
        const categoriesList = getCategoriesList().flat()
        setViews({
            all: [
                ...salariesList,
                ...categoriesList
            ],
            income: incomeList,
            outcome: outcomeList,
            salary: salariesList
        })
    }, [year])

    if (balanceHistory.length === 0) {
        return (
            <div className="flex justify-center">
                {/* @TODO: improve wording */}
                <EmptyScreen
                    Icon={Play}
                    iconClassnames={"ml-2"}
                    headline="Run Simulation first"
                    description="Before viewing your expenses and incomes, run the simulation to see them reflected in this area."
                />
            </div>
        )
    }
    if (!balanceHistory[year - 1]) {
        return (
            <div className="flex justify-center">
                {/* @TODO: improve wording */}
                <EmptyScreen
                    Icon={CircleOff}
                    headline="Not found"
                    description={`Could not found history balance for year ${year}`}
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-4">
            <Filters yearState={yearState} crrFilterState={crrFilterState} />
            <div
                className={cn(
                    "mb-16 overflow-hidden rounded-md border border-transparent bg-white dark:bg-dark-250",
                    "!border-gray-200 dark:!border-dark-300"
                )}
            >
                <ul
                    className="divide-y divide-neutral-200 dark:divide-dark-300"
                    data-testid="schedules"
                    ref={ulAnimationParentRef}
                >
                    {views?.[crrFilter].map((el) => el)}
                </ul>
            </div>

            {year && (
                <div className="mt-4 flex w-full justify-between px-3">
                    {balanceHistory[year - 1]?.income && (
                        <p className="text-md text-green-400">
                            INCOME:{" "}
                            <span className="text-xl">
                                {formatAmount(
                                    Math.abs(balanceHistory[year - 1]?.income as number)
                                )}
                            </span>
                        </p>
                    )}
                    {balanceHistory[year - 1]?.outcome && (
                        <p className="text-md text-red-400">
                            OUTCOME:{" "}
                            <span className="text-xl">
                                {formatAmount(
                                    Math.abs(balanceHistory[year - 1]?.outcome as number)
                                )}
                            </span>
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

export default function BalanceHistory() {
    const [hidden, setHidden] = useState(false);
    const [animationParentRef] = useAutoAnimate<HTMLDivElement>();

    return (
        <>
            <div className="mb-4 flex flex-col space-y-4" ref={animationParentRef}>
                {/* title */}
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
                        <div className="self-center rounded-md p-2 hover:bg-gray-200 dark:hover:bg-transparent">
                            <Switch
                                id="hidden"
                                checked={!hidden}
                                onCheckedChange={() => {
                                    setHidden(!hidden);
                                }}
                            />
                        </div>
                    </Tooltip>
                </div>
                {!hidden && <ListContainer />}
            </div>
        </>
    );
}
