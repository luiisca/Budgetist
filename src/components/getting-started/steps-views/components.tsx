import classNames from "classnames";
import { useCallback, useMemo, useState } from "react";
import { FiCheck, FiGlobe, FiPercent, FiX } from "react-icons/fi";
import {
  components as reactSelectComponents,
  GroupBase,
  OptionProps,
  SingleValue,
  ValueContainerProps,
} from "react-select";
import { Control, Controller, UseFormReturn } from "react-hook-form";
import {
  DEFAULT_INDEX_RETURN,
  DEFAULT_INFLATION,
  DEFAULT_INVEST_PERC,
  FLAG_URL,
} from "utils/constants";
import {
  getCountryOptions,
  getCurrency,
  getCurrencyOptions,
  SelectOption,
  SettingsFormValues,
} from "utils/sim-settings";
import showToast from "components/ui/core/notifications";
import { trpc } from "utils/trpc";
import countryToCurrency from "country-to-currency";
import { Label, NumberInput } from "components/ui";
import Select from "components/ui/core/form/select";

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

const LoadingIcon = () => (
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

export const ValueComponent = (
  props: ValueContainerProps<SelectOption, false, GroupBase<SelectOption>>
) => {
  console.log("VALUE COMPONENETS", props.getValue());
  const data = props.getValue()[0];
  // const { value, label } = props.getValue()[0] as unknown as {
  //   value: string;
  //   label: string;
  // } || [];
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

export const CurrencyInput = ({ control }: { control: Control }) => {
  const currencyOptions = useMemo(getCurrencyOptions, []);

  return (
    <Controller
      control={control}
      name="currency"
      render={({ field }) => (
        <>
          <Label className="text-gray-900">Currency</Label>
          <Select
            value={field.value}
            options={currencyOptions}
            onChange={(e) => e && field.onChange({ ...e })}
          />
        </>
      )}
    />
  );
};

export const Fields = ({
  form,
  user,
}: {
  form: UseFormReturn<SettingsFormValues>;
  user: Record<string, any>;
}) => {
  const [isLoadingInfl, setIsLoadingInfl] = useState<boolean | null>(null);
  const [isValidInfl, setIsValidInfl] = useState<boolean | null>(null);
  const { control } = form;
  const utils = trpc.useContext();

  const countryOptions = useMemo(getCountryOptions, []);

  const updateCurrency = useCallback(
    (
      countryData: SingleValue<SelectOption>,
      form: UseFormReturn<SettingsFormValues, any>
    ) => {
      const currencyCode =
        countryData?.value &&
        countryToCurrency[countryData.value as keyof SingleValue<SelectOption>];

      form.setValue("currency", getCurrency(currencyCode || "USD"));
    },
    []
  );
  const updateInflation = useCallback(
    async (
      countryData: SingleValue<SelectOption>,
      form: UseFormReturn<SettingsFormValues, any>
    ) => {
      let inflation = [];
      if (countryData) {
        const countryName = countryData.value;

        setIsValidInfl(null);
        setIsLoadingInfl(true);

        inflation = await utils.external.inflation.fetch(
          new Intl.DisplayNames("en", { type: "region" }).of(countryName) || ""
        );
        setIsLoadingInfl(false);

        if (!inflation || inflation.length === 0) {
          setIsValidInfl(false);
          setTimeout(() => setIsValidInfl(null), 2000);
          showToast(
            "Something went wrong updating inflation. Please try again or update manually",
            "warning"
          );
          return;
        }
        setIsValidInfl(true);
        setTimeout(() => setIsValidInfl(null), 2000);

        form.setValue("inflation", Math.round(+inflation[0].yearly_rate_pct), {
          shouldDirty: true,
        });
      }
    },
    []
  );

  return (
    <>
      {/* country */}
      <div>
        <Controller
          control={control}
          name="country"
          render={({ field }) => (
            <>
              <Label className="text-gray-900">Country</Label>
              <Select
                value={field.value}
                options={countryOptions}
                onChange={async (e) => {
                  field.onChange(e);
                  updateCurrency(e, form);
                  updateInflation(e, form);
                }}
                components={{
                  Option: OptionComponent,
                  ValueContainer: ValueComponent,
                }}
              />
            </>
          )}
        />
      </div>

      {/* currency */}
      <div className="flex space-x-3">
        <div className="flex-[1_1_80%]">
          <CurrencyInput control={control} />
        </div>

        {/* country inflation */}
        <div>
          <NumberInput<SettingsFormValues>
            control={control}
            name="inflation"
            label="Country inflation"
            addOnSuffix={<FiPercent />}
            placeholder={`${DEFAULT_INFLATION}`}
            defaultValue={user.inflation}
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
        </div>
      </div>

      {/* Investment per year perc */}
      <div>
        <NumberInput<SettingsFormValues>
          control={control}
          name="investPerc"
          label="Investment percentage"
          addOnSuffix={<FiPercent />}
          placeholder={`${DEFAULT_INVEST_PERC}`}
          defaultValue={user.investPerc}
        />
      </div>

      {/* annual return perc */}
      <div>
        <NumberInput<SettingsFormValues>
          control={control}
          name="indexReturn"
          label="Annual return"
          addOnSuffix={<FiPercent />}
          placeholder={`${DEFAULT_INDEX_RETURN}`}
          defaultValue={user.indexReturn}
        />
      </div>
    </>
  );
};
