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
import { useContext, useState } from "react";
import { BalanceContext } from "pages/simulation";
import { useForm } from "react-hook-form";
import { TitleWithInfo } from "./components";
import { Button, NumberInput, Tooltip, transIntoInt } from "components/ui";
import { capitalize } from "lodash";
import { formatAmount } from "utils/sim-settings";

const typeOptions = ["all", "income", "outcome", "salary"];

export default function BalanceHistory() {
  const {
    state: { balanceHistory },
  } = useContext(BalanceContext);

  const [hidden, setHidden] = useState(false);
  const [year, setYear] = useState(1);
  const [typeFilterValue, setTypeFilterValue] = useState(typeOptions[0]);
  const [animationParentRef] = useAutoAnimate<HTMLDivElement>();
  const [ulAnimationParentRef] = useAutoAnimate<HTMLUListElement>();

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
                    <DropdownMenuContent>
                      {typeOptions.map((type) => {
                        const capType = type;

                        return (
                          <DropdownMenuItem>
                            <Button
                              onClick={() => {
                                setTypeFilterValue(capType);
                              }}
                              type="button"
                              color="minimal"
                              className="w-full font-normal"
                            >
                              {capitalize(capType)}
                            </Button>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </Dropdown>

                  <form>
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
                    "mb-16 overflow-hidden rounded-md border border-transparent bg-white",
                    balanceHistory[year - 1] && "!border-gray-200"
                  )}
                >
                  <ul
                    className="divide-y divide-neutral-200"
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
                      )}
                    {typeFilterValue !== "salary" &&
                      balanceHistory[year - 1]?.categoriesBalance
                        .filter((category) => {
                          if (typeFilterValue === "all") return true;
                          return category.type === typeFilterValue;
                        })
                        .map((category, index) => {
                          if (category.records.length > 0) {
                            return category.records.map((record, index) => (
                              <ListItem
                                key={index}
                                infoBubble={
                                  <>
                                    <p>Inflation: </p>
                                    <p>{category.inflation}%</p>
                                    <p>Frequency: </p>
                                    <p>{category.frequency} / 12 </p>
                                  </>
                                }
                                category={{
                                  ...record,
                                  spent: formatAmount(Math.abs(record.spent)),
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
                                spent: formatAmount(Math.abs(category.spent)),
                              }}
                            />
                          );
                        })}
                  </ul>
                </div>

                {year && (
                  <div className="mt-4 flex w-full justify-between px-3">
                    <p className="text-md text-green-400">
                      INCOME:{" "}
                      <span className="text-xl">
                        {formatAmount(
                          Math.abs(balanceHistory[year - 1]?.income)
                        )}
                      </span>
                    </p>
                    <p className="text-md text-red-400">
                      OUTCOME:{" "}
                      <span className="text-xl">
                        {formatAmount(
                          Math.abs(balanceHistory[year - 1]?.outcome)
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
