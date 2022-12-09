import classNames from "classnames";
import { Label, NumberInput } from "components/ui";
import Select from "components/ui/core/form/select";
import countryToCurrency from "country-to-currency";
import { useCallback, useMemo } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import { FiCheck, FiGlobe, FiPercent, FiX } from "react-icons/fi";
import {
  components as reactSelectComponents,
  GroupBase,
  OptionProps,
  SingleValue,
  ValueContainerProps,
} from "react-select";
import { DEFAULT_INFLATION, FLAG_URL } from "utils/constants";
import {
  getCountryOptions,
  getCurrency,
  getCurrencyOptions,
  SelectOption,
} from "utils/sim-settings";

export const LoadingIcon = () => (
  <div className="absolute right-[2px] top-0 flex flex-row">
    <span className="mx-2 py-2">
      <svg
        className="mt-[2px] h-4 w-4 animate-spin text-black"
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
export const OptionComponent = (
  props: OptionProps<SelectOption, false, GroupBase<SelectOption>>
) => (
  <reactSelectComponents.Option
    {...props}
    className={classNames(
      "!flex !cursor-pointer !items-center !py-3 dark:bg-darkgray-100",
      props.isFocused && "!bg-gray-100 dark:!bg-darkgray-200",
      props.isSelected && "!bg-neutral-900 dark:!bg-darkgray-300"
    )}
  >
    <span className="mr-3">
      {props.data.value !== "default" ? (
        <img
          src={FLAG_URL.replace("{XX}", props.data.value)}
          alt={props.data.label + "flag"}
          role={props.data.label}
          className="w-5"
        />
      ) : (
        <FiGlobe className="h-5 w-5 text-brand-400" />
      )}
    </span>
    <span className="flex-1">{props.label}</span>{" "}
    {props.isSelected && <FiCheck className="h-4 w-4" />}
  </reactSelectComponents.Option>
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
          <FiGlobe className="h-5 w-5 text-brand-400" />
        )}
      </span>
      <reactSelectComponents.ValueContainer
        {...props}
        className={classNames(
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
    (countryData: SingleValue<SelectOption>, form: UseFormReturn<T, any>) => {
      const currencyCode =
        countryData?.value &&
        countryToCurrency[countryData.value as keyof SingleValue<SelectOption>];

      form.setValue(
        "currency" as Path<T>,
        getCurrency(currencyCode || "USD") as PathValue<T, Path<T>>
      );
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
            value={field.value}
            options={options}
            onChange={async (e) => {
              field.onChange(e);
              updateCurrencyActive && updateCurrency(e, form);
              updateInflation(e, form, inflName);
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
      label="Country inflation"
      addOnSuffix={<FiPercent />}
      placeholder={`${DEFAULT_INFLATION}`}
      loader={
        <>
          <div className="absolute right-[2px] top-0 flex flex-row">
            <span className={classNames("mx-2 py-2")}>
              {isLoadingInfl === false && isValidInfl && (
                <FiCheck className="mt-[2px] w-6" />
              )}
              {isLoadingInfl === false && isValidInfl === false && (
                <FiX className="mt-[2px] w-6" />
              )}
            </span>
          </div>
          {isLoadingInfl && <LoadingIcon />}
        </>
      }
    />
  );
};
