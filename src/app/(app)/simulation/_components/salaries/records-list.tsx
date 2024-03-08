'use client'

// < RecordsList<SalaryDataInputTypeClient>
// name="variance"
// infoCont = {
//         <>
//             Your salary increase over time.
//             < br />
//     Input the starting year and how much you expect to make < br /> { " "}
//             until the next period.
//         </>
//     }
// isDisabled = { salaryMutation.isLoading }
// fieldArray = { fieldArray }
// newRecordShape = {{
//     from: Number(watchLatestFromVal) + 1 || 1,
//         amount: watchAmountVal,
//             taxPercent: DEFAULT_TAX_PERCENT,
//     }}
// switchOnChecked = {() => {
// salaryForm.setValue("amount", watchAmountVal, {
//     shouldDirty: true,
// });

// if (!varianceHidden) {
//     remove();
// } else {
//     append({
//         from: 1,
//         amount: watchAmountVal,
//         taxPercent: DEFAULT_TAX_PERCENT,
//     });
// }
// setVarianceHidden(!varianceHidden);
// }}
// >
// {
//     (index: number) => (
//         <>
//         </>
//     )
// }
// </RecordsList >


import { toast } from 'sonner';
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Button, Label, NumberInput, TextField, Tooltip } from "~/components/ui";
import { Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
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
import { getCountryOptionLabel, getCurrencyLocaleName, getCurrencyOptions } from '~/lib/sim-settings';
import { CatInputType, SalInputType } from 'prisma/zod-utils';
import { BASIC_BAL_TYPES, DEFAULT_FREQUENCY, DEFAULT_TAX_PERCENT, OptionsType, SELECT_OUTCOME_VAL, getSelectOptionWithFallback } from '~/lib/constants';
import { RouterOutputs } from '~/lib/trpc/shared';
import useUpdateInflation from '~/app/(app)/_lib/use-update-inflation';
import { ControlledSelect } from '~/components/ui/core/form/select/Select';
import { CountryInflInput, CountrySelect } from '../fields';
import { api } from '~/lib/trpc/react';
import { BalanceContext } from '../../_lib/context';

const Variance = ({
    position,
    fieldArray,
}: {
    position: number;
    fieldArray: UseFieldArrayReturn<FieldValues, "variance", "id">;
}) => {
    const { dispatch: balanceDispatch, state: { years } } = useContext(BalanceContext);

    const {
        register,
        control,
        setError,
        clearErrors,
        formState: { errors },
    } = useFormContext<SalInputType>();
    const { remove } = fieldArray;
    const [varianceArrWatcher, taxTypeWatcher, periodIdWatcher] = useWatch({
        control,
        name: ["variance", 'taxType', `variance.${position}.id`]
    })
    const deletePeriodMutation = api.simulation.salaries.variance.delete.useMutation({
        onMutate: () => {
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: true,
            });
        },
        onSuccess: async () => {
            toast.success("Record deleted");
            balanceDispatch({
                type: "SIM_RUN",
                years
            })
        },
        onError: async () => {
            toast.error(`Could not delete record. Please try again.`);
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: false,
            });
            // @TODO: handle optimistic removal and failure
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
                    periodIdWatcher && deletePeriodMutation.mutate({ id: periodIdWatcher })

                    remove(position)
                }}
            >
                <X className="h-4 w-4" />
            </Button>
        </>
    )
}

export default function RecordsList({
    user,
    isMutationLoading,
}: {
    user: NonNullable<RouterOutputs['user']['me']>;
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
