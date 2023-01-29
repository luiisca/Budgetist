import { useAutoAnimate } from "@formkit/auto-animate/react";
import Switch from "components/ui/core/Switch";
import EmptyScreen from "components/ui/core/EmptyScreen";
import { FiChevronDown, FiClock } from "react-icons/fi";
import { ListItem } from "components/ui/ListItem";
import classNames from "classnames";
import Dropdown, {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/Dropdown";
import { useContext, useRef, useState } from "react";
import { BalanceContext } from "pages/simulation";
import { useForm } from "react-hook-form";
import { TitleWithInfo } from "./components";
import {
  Button,
  NumberInput,
  SkeletonText,
  Tooltip,
  transIntoInt,
} from "components/ui";
import { capitalize } from "lodash";
import { formatAmount } from "utils/sim-settings";

const typeOptions = ["all", "income", "outcome", "salary"];

export default function BalanceHistory() {
  const {
    state: { balanceHistory, selCurrency },
  } = useContext(BalanceContext);

  const [hidden, setHidden] = useState(false);
  const [year, setYear] = useState(1);
  const [typeFilterValue, setTypeFilterValue] = useState(typeOptions[0]);
  const [itemSelectedId, setItemSelectedId] = useState(
    typeOptions.findIndex((item) => item === typeFilterValue)
  );

  const [animationParentRef] = useAutoAnimate<HTMLDivElement>();
  const [ulAnimationParentRef] = useAutoAnimate<HTMLUListElement>();
  const dropdownMenuRef = useRef<null | HTMLDivElement>(null);

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
            <div className="self-center rounded-md p-2 hover:bg-gray-200 dark:hover:bg-transparent">
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
                        {capitalize(typeFilterValue)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent ref={dropdownMenuRef}>
                      {typeOptions.map((type, index) => {
                        const capType = type;

                        return (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => {
                              setTypeFilterValue(capType);
                              setItemSelectedId(index);
                            }}
                          >
                            <Button
                              type="button"
                              color="minimal"
                              className={classNames(
                                "w-full font-normal",
                                itemSelectedId === index
                                  ? "!bg-neutral-900 !text-white hover:!bg-neutral-900 dark:!bg-dark-accent-100 dark:!text-dark-neutral dark:hover:!bg-dark-accent-100"
                                  : "dark:hover:!bg-dark-400"
                              )}
                            >
                              {capitalize(capType)}
                            </Button>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </Dropdown>

                  <form onSubmit={(e) => e.preventDefault()}>
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
                    "mb-16 overflow-hidden rounded-md border border-transparent bg-white dark:bg-dark-250",
                    balanceHistory[year - 1] &&
                      "!border-gray-200 dark:!border-dark-300"
                  )}
                >
                  <ul
                    className="divide-y divide-neutral-200 dark:divide-dark-300"
                    data-testid="schedules"
                    ref={ulAnimationParentRef}
                  >
                    {(typeFilterValue === "salary" ||
                      typeFilterValue === "all") &&
                      balanceHistory[year - 1]?.salariesBalance.map(
                        (salary, index) => (
                          <ListItem
                            key={index}
                            infoBubble={
                              <>
                                <p>Amount: </p>
                                <p>
                                  {selCurrency &&
                                    formatAmount(
                                      salary.amountBefTax,
                                      selCurrency
                                    )}
                                </p>
                                <p>Tax Perc: </p>
                                <p>{salary.taxPercent}%</p>
                              </>
                            }
                            category={{
                              ...salary,
                              spent: selCurrency
                                ? formatAmount(
                                    Math.abs(salary.amountAftTax),
                                    selCurrency
                                  )
                                : null,
                            }}
                          />
                        )
                      )}
                    {typeFilterValue !== "salary" &&
                      balanceHistory[year - 1]?.categoriesBalance.map(
                        (category, index) => {
                          if (category.records.length > 0) {
                            return category.records.map((record, index) => {
                              if (
                                typeFilterValue === "all" ||
                                record.type === typeFilterValue
                              ) {
                                return (
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
                                      spent: selCurrency
                                        ? formatAmount(
                                            Math.abs(record.spent),
                                            selCurrency
                                          )
                                        : null,
                                      parentTitle: category.title,
                                      record: true,
                                    }}
                                  />
                                );
                              }

                              return null;
                            });
                          }

                          if (
                            typeFilterValue === "all" ||
                            category.type === typeFilterValue
                          ) {
                            return (
                              <ListItem
                                key={index}
                                category={{
                                  ...category,
                                  spent: selCurrency
                                    ? formatAmount(
                                        Math.abs(category.spent),
                                        selCurrency
                                      )
                                    : null,
                                }}
                              />
                            );
                          }

                          return null;
                        }
                      )}
                  </ul>
                </div>

                {year && (
                  <div className="mt-4 flex w-full justify-between px-3">
                    <p className="text-md text-green-400">
                      INCOME:{" "}
                      <span className="text-xl">
                        {selCurrency &&
                          formatAmount(
                            Math.abs(balanceHistory[year - 1]?.income),
                            selCurrency
                          )}
                      </span>
                    </p>
                    <p className="text-md text-red-400">
                      OUTCOME:{" "}
                      <span className="text-xl">
                        {selCurrency &&
                          formatAmount(
                            Math.abs(balanceHistory[year - 1]?.outcome),
                            selCurrency
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
}
