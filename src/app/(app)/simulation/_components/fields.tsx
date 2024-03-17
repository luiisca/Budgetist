import { useCallback, useMemo } from "react";
import countryToCurrency, { Countries } from "country-to-currency";
import {
    Control,
    Controller,
    FieldValues,
    Path,
    PathValue,
    UseFormReturn,
} from "react-hook-form";

import { cn } from "~/lib/cn";
import { Label, NumberInput } from "~/components/ui";
import Select from "~/components/ui/core/form/select";
import { OptionComponent } from "~/components/ui/core/form/select/components";
import { Check, Globe, Percent, X } from "lucide-react";
import {
    components as reactSelectComponents,
    GroupBase,
    OptionProps,
    SingleValue,
    ValueContainerProps,
} from "react-select";
import { DEFAULT_CURRENCY, DEFAULT_INFLATION, FLAG_URL } from "~/lib/constants";
import {
    getCountryOptions,
    getCurrency,
    getCurrencyLocaleName,
    SelectOption,
} from "~/lib/sim-settings";

export const LoadingIcon = () => (
    <div className="absolute right-[2px] top-0 flex flex-row">
        <span className="mx-2 py-2">
            <svg
                className="mt-[2px] h-4 w-4 animate-spin text-black dark:text-brand"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </span>
    </div>
);

// country select
export const Option = (
    props: OptionProps<SelectOption, false, GroupBase<SelectOption>>
) => (
    <OptionComponent {...props}>
        <span className="mr-3">
            {props.data.value !== "default" ? (
                <img
                    src={FLAG_URL.replace("{XX}", props.data.value)}
                    alt={props.data.label + "flag"}
                    role={props.data.label}
                    className="w-5"
                />
            ) : (
                <Globe className="h-5 w-5 text-brand-400" />
            )}
        </span>
        <span className="flex-1">{props.label}</span>{" "}
        {props.isSelected && <Check className="h-4 w-4" />}
    </OptionComponent>
);

export const ValueComponent = (
    props: ValueContainerProps<SelectOption, false, GroupBase<SelectOption>>
) => {
    const data = props.getValue()[0];

    return (
        <div className="flex items-center">
            <span className="ml-3">
                {!data?.value || !data?.label ? (
                    <span className="block w-5" />
                ) : data?.value && data.label && data.value !== "default" ? (
                    <img
                        src={FLAG_URL.replace("{XX}", data.value)}
                        alt={data.label + "flag"}
                        role={data.label}
                        className="w-5"
                    />
                ) : (
                    <Globe className="h-5 w-5 text-brand-400" />
                )}
            </span>
            <reactSelectComponents.ValueContainer
                {...props}
                className={cn(
                    "text-black placeholder:text-gray-400 dark:text-darkgray-900 dark:placeholder:text-darkgray-500"
                )}
            />
        </div>
    );
};

export const CountrySelect = <T extends FieldValues>({
    form,
    name,
    control,
    updateCurrencyActive,
    updateInflation,
    inflName,
}: {
    form: UseFormReturn<T>;
    name: string;
    control: Control<T>;
    updateCurrencyActive?: boolean;
    updateInflation: (
        countryData: SingleValue<SelectOption>,
        form: UseFormReturn<T, any>,
        inflName: string
    ) => Promise<void>;
    inflName: string;
}) => {
    const options = useMemo(getCountryOptions, []);

    const updateCurrency = useCallback(
        (form: UseFormReturn<T, any>, countryCode?: string) => {
            const currencyCodeFromCountry =
                countryCode ? countryToCurrency[countryCode as Countries] : null;

            console.log('currencyCodeFromCountry', currencyCodeFromCountry)
            if (currencyCodeFromCountry) {
                form.setValue(
                    "currency" as Path<T>,
                    {
                        value: currencyCodeFromCountry,
                        label: getCurrencyLocaleName(currencyCodeFromCountry, countryCode)
                    } as PathValue<T, Path<T>>
                );
            }
        },
        []
    );

    return (
        <Controller
            control={control}
            name={name as Path<T>}
            render={({ field }) => (
                <>
                    <Label className="text-gray-900">Country</Label>
                    <Select<SelectOption>
                        {...field}
                        options={options}
                        onChange={async (e) => {
                            field.onChange(e);
                            if (e?.value !== 'default') {
                                updateCurrencyActive && updateCurrency(form, e?.value);
                                updateInflation(e, form, inflName);
                            } else {
                                form.setValue(inflName as Path<T>, '' as PathValue<T, Path<T>>)
                            }
                        }}
                        components={{
                            Option: OptionComponent,
                            ValueContainer: ValueComponent,
                        }}
                    />
                </>
            )}
        />
    );
};

// country inflation input
export const CountryInflInput = <T extends FieldValues>({
    control,
    name,
    isLoadingInfl,
    isValidInfl,
}: {
    control: Control<T>;
    name: string;
    isLoadingInfl: boolean | null;
    isValidInfl: boolean | null;
}) => {
    return (
        <NumberInput<T>
            control={control}
            name={name as Path<T>}
            label="Country inflation (opt.)"
            addOnSuffix={<Percent />}
            placeholder={`${DEFAULT_INFLATION}`}
            loader={
                <>
                    <div className="absolute right-[2px] top-0 flex flex-row">
                        <span className={cn("mx-2 py-2")}>
                            {isLoadingInfl === false && isValidInfl && (
                                <Check className="mt-[2px] w-6 dark:text-brand" />
                            )}
                            {isLoadingInfl === false && isValidInfl === false && (
                                <X className="mt-[2px] w-6 dark:text-brand" />
                            )}
                        </span>
                    </div>
                    {isLoadingInfl && <LoadingIcon />}
                </>
            }
            customNumValidation
            onChange={(parsedValue: number) => {
                if (parsedValue < 0) {
                    return 0
                }
                if (parsedValue > 100) {
                    return 100
                }
                return parsedValue
            }}
        />
    );
};
