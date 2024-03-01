'use client'

import { toast } from 'sonner';
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Button, Label, NumberInput, TextField, Tooltip } from "~/components/ui";
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import {
    UseFieldArrayReturn,
    useFieldArray,
    useFormContext,
    useWatch,
} from "react-hook-form";
import { Plus, X } from 'lucide-react';
import Switch from '~/components/ui/core/switch';
import TitleWithInfo from '../title-with-info';
import { getCountryLocaleName, getCurrencyLocaleName, getCurrencyOptions } from '~/lib/sim-settings';
import { CatInputDataType } from 'prisma/zod-utils';
import { BASIC_BAL_TYPES, DEFAULT_FREQUENCY, OptionsType, SELECT_OUTCOME_VAL, getSelectOptionWithFallback } from '~/lib/constants';
import { RouterOutputs } from '~/lib/trpc/shared';
import useUpdateInflation from '~/app/(app)/_lib/use-update-inflation';
import { ControlledSelect } from '~/components/ui/core/form/select/Select';
import { CountryInflInput, CountrySelect } from '../fields';
import { api } from '~/lib/trpc/react';

const Record = ({
    index,
    fieldArray,
}: {
    index: number;
    fieldArray: UseFieldArrayReturn<CatInputDataType>;
}) => {
    const [inflDisabled, setInflDisabled] = useState(false);
    const categoryForm = useFormContext<CatInputDataType>();
    const { register, control } = categoryForm;
    const { remove } = fieldArray;

    const { updateInflation, isLoadingInfl, isValidInfl } = useUpdateInflation<CatInputDataType>();

    const [typeWatcher, freqTypeWatcher, inflTypeWatcher, currencyWatcher, recordTypeWatcher] = useWatch({
        control,
        name: ["type", "freqType", "inflType", "currency", `records.${index}.type`],
    });
    const res = api.user.me.useQuery();
    const user = res.data as NonNullable<RouterOutputs['user']['me']>

    return (
        <>
            {/* <Title /> */}
            <div>
                <TextField
                    label="Title"
                    placeholder=""
                    {...register(`records.${index}.title`)}
                />
            </div>
            {/* <Amount /> */}
            <div>
                <NumberInput<CatInputDataType>
                    control={control}
                    name={`records.${index}.amount`}
                    label="Amount"
                    placeholder=""
                />
            </div>
            {/* <SelectType /> */}
            <div>
                <ControlledSelect<CatInputDataType>
                    control={control}
                    options={() => BASIC_BAL_TYPES}
                    onChange={(option) => {
                        setInflDisabled(option.value === "income");

                        return option;
                    }}
                    name={`records.${index}.type`}
                    label="Type"
                />
            </div>
            {((typeWatcher?.value === "income" && recordTypeWatcher?.value === "outcome") ||
                (typeWatcher?.value === "outcome" && inflTypeWatcher?.value === "perRec" && recordTypeWatcher?.value === "outcome")) && (
                    <>
                        {/* <Inflation switch /> */}
                        <div className="mb-4 flex items-center space-x-2">
                            <Label>Inflation</Label>
                            <Tooltip
                                content={`${inflDisabled ? "Enable" : "Disable"} inflation`}
                            >
                                <div className="self-center rounded-md p-2 hover:bg-gray-200">
                                    <Switch
                                        id="disabled"
                                        checked={!inflDisabled}
                                        onCheckedChange={() => setInflDisabled(!inflDisabled)}
                                    />
                                </div>
                            </Tooltip>
                        </div>
                        {!inflDisabled && (
                            <div className="flex space-x-3">
                                {/* country Select */}
                                <div className="flex-[1_1_80%]">
                                    <CountrySelect<CatInputDataType>
                                        form={categoryForm}
                                        name={`records.${index}.country`}
                                        control={control}
                                        updateInflation={updateInflation}
                                        inflName={`records.${index}.inflation`}
                                    />
                                </div>

                                {/* country inflation */}
                                <div>
                                    <CountryInflInput<CatInputDataType>
                                        control={control}
                                        name={`records.${index}.inflation`}
                                        isLoadingInfl={isLoadingInfl}
                                        isValidInfl={isValidInfl}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            {/* freqType === 'perRec' => <Frequency /> */}
            {freqTypeWatcher?.value === "perRec" && (
                <div>
                    <NumberInput<CatInputDataType>
                        control={control}
                        name={`records.${index}.frequency`}
                        label="Yearly Frequency"
                        placeholder=""
                        addOnSuffix={<span>p.a.</span>}
                    />
                </div>
            )}
            {/* currency === 'perRec' => <Currency /> */}
            {currencyWatcher?.value === "perRec" && (
                <div>
                    <ControlledSelect<CatInputDataType>
                        control={control}
                        options={() => getCurrencyOptions({ countryCode: user.country })}
                        name={`records.${index}.currency`}
                        label="Currency"
                    />
                </div>
            )}
            <Button
                color="primary"
                className="mt-3"
                onClick={() => {
                    remove(index);
                }}
            >
                <X className="h-4 w-4" />
            </Button>
        </>
    );
};

export default function RecordsList({
    user,
    disabledState,
    isMutationLoading,
}: {
    user: NonNullable<RouterOutputs['user']['me']>;
    disabledState: [boolean, Dispatch<SetStateAction<boolean>>];
    isMutationLoading: boolean;
}) {
    // form
    const form = useFormContext<CatInputDataType>();
    const fieldArray = useFieldArray({
        name: "records",
    });
    const { formState: { errors }, control } = form;
    const { fields, append, remove } = fieldArray;
    const [titleValWatcher, typeWatcher, inflValWatcher, currencyWatcher, watchLatestRecordInflType] = useWatch({
        control,
        name: ["title", "type", "inflVal", "currency", `records.${fields.length - 1}.type`],
    });

    const newRecordDefaultShape = {
        title: "",
        amount: "" as unknown as number,
        type: getSelectOptionWithFallback(typeWatcher?.value as OptionsType, SELECT_OUTCOME_VAL),
        frequency: DEFAULT_FREQUENCY,
        inflType: watchLatestRecordInflType?.value !== "income",
        country: {
            value: user.country,
            // @TODO: when will user.country be 'default'
            label: getCountryLocaleName(user.country),
        },
        inflation: inflValWatcher || user.inflation,
        currency: {
            value: currencyWatcher.value,
            label: getCurrencyLocaleName((currencyWatcher.value || user.currency), user.country),
        },
    };

    useEffect(() => {
        if (errors.records && errors.records?.message) {
            toast.error(errors.records?.message as string);
        }
    }, [errors]);

    const [recordsAnimationParentRef] = useAutoAnimate<HTMLUListElement>();
    const [disabled, setDisabled] = disabledState;

    return (
        <div>
            <div className="mb-4 flex items-center space-x-2">
                <TitleWithInfo
                    Title={() => <Label className="!m-0">Records</Label>}
                    infoCont={<>Your monthly expenses for {titleValWatcher || "current"} category</>}
                />
                <Tooltip content={`${disabled ? "Enable" : "Disable"} records`}>
                    <div className="self-center rounded-md p-2 hover:bg-gray-200 dark:bg-transparent">
                        <Switch
                            id="disabled"
                            checked={!disabled}
                            onCheckedChange={() => {
                                // setValue("title", titleValWatcher, {
                                //     shouldDirty: true,
                                // });

                                if (!disabled) {
                                    remove();
                                } else {
                                    append(newRecordDefaultShape);
                                }

                                setDisabled(!disabled);
                            }}
                        />
                    </div>
                </Tooltip>
            </div>

            {!disabled && (
                <>
                    <ul className="space-y-4" ref={recordsAnimationParentRef}>
                        {fields.map((field, index) => (
                            <li key={field.id}>
                                <div className="flex items-center space-x-3" key={index}>
                                    <Record index={index} fieldArray={fieldArray} />
                                </div>
                            </li>
                        ))}
                    </ul>

                    <Button
                        color="primary"
                        disabled={isMutationLoading}
                        className="mt-3"
                        onClick={() => {
                            append(newRecordDefaultShape);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </>
            )}
        </div>
    );
};
