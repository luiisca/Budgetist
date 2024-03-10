'use client'

import { toast } from 'sonner';
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Button, Label, NumberInput, Tooltip } from "~/components/ui";
import { useContext, useEffect, useState } from "react";
import {
    FieldValues,
    UseFieldArrayReturn,
    useFieldArray,
    useFormContext,
    useWatch,
} from "react-hook-form";
import { Percent, Plus, X } from 'lucide-react';
import Switch from '~/components/ui/core/switch';
import TitleWithInfo from '../title-with-info';
import { SalInputType } from 'prisma/zod-utils';
import { DEFAULT_TAX_PERCENT } from '~/lib/constants';
import { api } from '~/lib/trpc/react';
import { BalanceContext } from '../../_lib/context';

const Variance = ({
    position,
    fieldArray,
}: {
    position: number;
    fieldArray: UseFieldArrayReturn<FieldValues, "variance", "id">;
}) => {
    const utils = api.useUtils()
    const { dispatch: balanceDispatch, state: { years } } = useContext(BalanceContext);

    const {
        register,
        control,
        setError,
        clearErrors,
        formState: { errors },
    } = useFormContext<SalInputType>();
    const { remove, insert } = fieldArray;

    const allValuesWatcher = useWatch({
        control,
        name: `variance.${position}`
    })

    const [varianceArrWatcher, taxTypeWatcher, periodIdWatcher] = useWatch({
        control,
        name: ["variance", 'taxType', `variance.${position}.id`]
    })
    const deletePeriodMutation = api.simulation.salaries.variance.delete.useMutation({
        onMutate: () => {
            const catsData = utils.simulation.categories.get.getData()
            const shouldRunSim = catsData && catsData.length > 0
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

            // optimistically remove period
            remove(position);

            return { shouldRunSim }
        },
        onSuccess: (d, v, ctx) => {
            toast.success("Record deleted");

            if (ctx?.shouldRunSim) {
                balanceDispatch({
                    type: "SIM_RUN",
                    years
                })
            }
        },
        onError: (e, v, ctx) => {
            toast.error(`Could not delete record. Please try again.`);
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: false,
            });
            if (!ctx?.shouldRunSim) {
                balanceDispatch({
                    type: "TOTAL_BAL_SET_HIDDEN",
                    totalBalanceHidden: true,
                });
            }

            // insert period back if couldn't be deleted
            insert(position, allValuesWatcher)
        },
    });

    return (
        <>
            {/* id */}
            {periodIdWatcher && <input {...register(`variance.${position}.id`)} hidden />}

            {/* period */}
            <NumberInput
                label="From"
                control={control}
                name={`variance.${position}.from`}
                onChange={(parsedValue: number) => {
                    console.log('varianceArrWatcher', varianceArrWatcher)
                    if (!varianceArrWatcher) return parsedValue;

                    // validate all fields on every keystroke
                    varianceArrWatcher.reduce((prevVariance, crrVariance, index) => {
                        // use parsedValue when validating neighbors as new val is not yet registered by useWatch
                        const prevFromVal = position === index - 1 ? parsedValue : prevVariance?.from;
                        const crrFromVal = position === index ? parsedValue : crrVariance.from;
                        const nextFromVal =
                            position === index + 1
                                ? parsedValue
                                : varianceArrWatcher[index + 1] && varianceArrWatcher[index + 1]?.from;

                        if (nextFromVal && crrFromVal >= nextFromVal) {
                            setError(`variance.${index}.from`, {
                                message: "Must be smaller than next 'from' value",
                            });
                        } else if (prevFromVal && crrFromVal <= prevFromVal) {
                            setError(`variance.${index}.from`, {
                                message: "Must be greater than previous 'from' value",
                            });
                        } else {
                            errors && clearErrors(`variance.${index}.from`);
                        }

                        return crrVariance;
                    }, {} as { from: number; amount: number });

                    return parsedValue;
                }}
            />
            {/* amount */}
            <NumberInput
                control={control}
                name={`variance.${position}.amount`}
                label="Amount"
            />
            {/* taxes */}
            {taxTypeWatcher?.value === "perRec" && (
                <div>
                    <NumberInput
                        control={control}
                        name={`variance.${position}.taxPercent`}
                        label="Income Taxes"
                        addOnSuffix={<Percent />}
                        placeholder={`${DEFAULT_TAX_PERCENT}`}
                        onChange={(parsedValue: number) => parsedValue > 100 ? 100 : parsedValue}
                    />
                </div>
            )}
            <Button
                type='button'
                color="primary"
                className="mt-3"
                onClick={() => {
                    if (periodIdWatcher) {
                        deletePeriodMutation.mutate({ id: periodIdWatcher })
                    } else {
                        remove(position)
                    }
                }}
            >
                <X className="h-4 w-4" />
            </Button>
        </>
    )
}

export default function RecordsList({
    isMutationLoading,
}: {
    isMutationLoading: boolean;
}) {
    // form
    const form = useFormContext<SalInputType>();
    const fieldArray = useFieldArray({
        name: "variance",
    });
    const { formState: { errors }, control } = form;
    const { fields, append, remove } = fieldArray;
    const [latestFromValWatcher, amountValWatcher, taxPercentWatcher] = useWatch({
        control,
        name: [`variance.${fields.length - 1}.from`, "amount", "taxPercent"],
    });

    const newPeriodDefaultShape = {
        from: latestFromValWatcher + 1,
        amount: amountValWatcher,
        taxPercent: taxPercentWatcher,
    };

    useEffect(() => {
        if (errors.variance && errors.variance?.message) {
            toast.error(errors.variance?.message as string);
        }
    }, [errors]);

    const [varianceAnimationParentRef] = useAutoAnimate<HTMLUListElement>();
    const [disabled, setDisabled] = useState(false);

    return (
        <div>
            <div className="mb-4 flex items-center space-x-2">
                <TitleWithInfo
                    Title={() => <Label className="!m-0">variance</Label>}
                    infoCont={<>
                        Your salary increase over time.
                        <br />
                        Input the starting year and how much you expect to make <br />{" "}
                        until the next period.
                    </>}
                />
                <Tooltip content={`${disabled ? "Enable" : "Disable"} variance`}>
                    <div className="self-center rounded-md p-2 hover:bg-gray-200 dark:bg-transparent">
                        <Switch
                            id="disabled"
                            checked={!disabled}
                            onCheckedChange={() => {
                                // if (!disabled) {
                                //     remove();
                                // } else {
                                //     append({
                                //         from: 1,
                                //         amount: watchAmountVal,
                                //         taxPercent: DEFAULT_TAX_PERCENT,
                                //     });
                                // }
                                !disabled && remove()
                                setDisabled(!disabled);
                            }}
                        />
                    </div>
                </Tooltip>
            </div>

            {!disabled && (
                <>
                    <ul className="space-y-4" ref={varianceAnimationParentRef}>
                        {fields.map((field, index) => (
                            <li key={field.id}>
                                <div className="flex items-center space-x-3">
                                    <Variance position={index} fieldArray={fieldArray} />
                                </div>
                            </li>
                        ))}
                    </ul>

                    <Button
                        type='button'
                        color="primary"
                        disabled={isMutationLoading}
                        className="mt-3"
                        onClick={() => {
                            append(newPeriodDefaultShape);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </>
            )}
        </div>
    );
};
