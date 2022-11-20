import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useRouter } from "next/router";
import { profileData, ProfileDataInputType } from "prisma/*";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import { FiCheck, FiGlobe, FiPercent } from "react-icons/fi";
import { trpc } from "utils/trpc";
import { z } from "zod";
import { useCallback, useMemo, useState } from "react";
import {
  components as reactSelectComponents,
  GroupBase,
  OptionProps,
  SingleValue,
  ValueContainerProps,
} from "react-select";
import classNames from "classnames";
import countryToCurrency from "country-to-currency";

import { FLAG_URL } from "utils/constants";
import { Button, Form, Label, NumberInput } from "components/ui";
import Select from "components/ui/core/form/select";
import showToast from "components/ui/core/notifications";
import {
  getCountryLabel,
  getCountryOptions,
  getCurrency,
  getCurrencyOptions,
  SelectOption,
} from "utils/select";

type FormValues = Omit<ProfileDataInputType, "country" | "currency"> & {
  country?: SelectOption;
  currency?: SelectOption;
};
const selectOptionsData = z.object({
  value: z.string().optional(),
  label: z.string().optional(),
});

const OptionComponent = (
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
const ValueComponent = (
  props: ValueContainerProps<SelectOption, false, GroupBase<SelectOption>>
) => {
  const { value, label } = props.getValue()[0] as unknown as {
    value: string;
    label: string;
  };
  return (
    <div className="flex items-center">
      <span className="ml-3">
        {value !== "default" && value ? (
          <img
            src={FLAG_URL.replace("{XX}", value)}
            alt={label + "flag"}
            role={label}
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

const SimSettings = ({ user }: { user: User }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(
      profileData.extend({
        country: selectOptionsData,
        currency: selectOptionsData,
      })
    ),
    reValidateMode: "onChange",
    defaultValues: {
      country: { value: user.country, label: getCountryLabel(user.country) },
      inflation: user.inflation || 0,
      currency: getCurrency(user.currency),
      investPerc: user.investPerc || 0,
      indexReturn: user.indexReturn || 0,
    },
  });
  const [isLoadingInfl, setIsLoadingInfl] = useState<boolean>(false);
  const [isValidInfl, setIsValidInfl] = useState<boolean | null>(false);
  const { control } = form;
  const utils = trpc.useContext();
  const router = useRouter();

  const mutation = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      showToast("Your user profile has been updated successfully.", "success");
      await utils.user.me.refetch();
      router.push("/");
    },
    onError: () => {
      showToast(
        "There was a problem saving your data. Please try again",
        "error"
      );
    },
  });
  const countryOptions = useMemo(getCountryOptions, []);
  const currencyOptions = useMemo(getCurrencyOptions, []);

  const updateCurrency = useCallback(
    (
      countryData: SingleValue<SelectOption>,
      form: UseFormReturn<FormValues, any>
    ) => {
      const currencyCode =
        countryData?.value &&
        countryToCurrency[countryData.value as keyof SingleValue<SelectOption>];

      countryData?.value &&
        console.log(
          `CURRENCY CODE FOR ${countryData?.label} (${countryData?.value})`,
          currencyCode
        );

      form.setValue("currency", getCurrency(currencyCode || "USD"));
    },
    []
  );
  const updateInflation = useCallback(
    async (
      currencyData: SingleValue<SelectOption>,
      form: UseFormReturn<FormValues, any>
    ) => {
      let inflation = [];
      if (currencyData) {
        form.setValue("country", { ...currencyData });

        setIsValidInfl(null);
        setIsLoadingInfl(true);
        inflation = await utils.external.inflation.fetch(
          new Intl.DisplayNames("en", { type: "region" }).of(
            currencyData.value
          ) || ""
        );
        setIsLoadingInfl(false);
        if (inflation.length === 0) {
          showToast(
            "No inflation value found for selected country. Please update manually",
            "warning"
          );
          return;
        }
        setIsValidInfl(true);
        setTimeout(() => setIsValidInfl(false), 2000);

        form.setValue("inflation", Math.round(+inflation[0].yearly_rate_pct));
      }
    },
    []
  );

  return (
    <Form<FormValues>
      form={form}
      handleSubmit={(values) => {
        mutation.mutate({
          ...values,
          country: values.country?.value,
          currency: values.currency?.value,
          completedOnboarding: true,
        });
      }}
      className="space-y-6"
    >
      {/* country */}
      <div>
        <Controller
          control={control}
          name="country"
          render={({ field: { value } }) => (
            <>
              <Label className="text-gray-900">Country</Label>
              <Select
                value={value}
                options={countryOptions}
                onChange={async (e) => {
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
          <Controller
            control={control}
            name="currency"
            render={({ field: { value } }) => (
              <>
                <Label className="text-gray-900">Currency</Label>
                <Select
                  value={value}
                  options={currencyOptions}
                  onChange={(e) => e && form.setValue("currency", { ...e })}
                />
              </>
            )}
          />
        </div>

        {/* country inflation */}
        <div>
          <NumberInput<FormValues>
            control={control}
            name="inflation"
            label="Country inflation"
            addOnSuffix={<FiPercent />}
            placeholder="7"
            defaultValue={user.inflation}
            loader={
              <>
                {isValidInfl && (
                  <div className="absolute right-[2px] top-0 flex flex-row">
                    <span className={classNames("mx-2 py-2")}>
                      <FiCheck className="mt-[2px] w-6" />
                    </span>
                  </div>
                )}
                {isLoadingInfl && <LoadingIcon />}
              </>
            }
          />
        </div>
      </div>

      {/* Investment per year perc */}
      <div>
        <NumberInput<FormValues>
          control={control}
          name="investPerc"
          label="Investment percentage"
          addOnSuffix={<FiPercent />}
          placeholder="75"
          defaultValue={user.investPerc}
        />
      </div>

      {/* annual return perc */}
      <div>
        <NumberInput<FormValues>
          control={control}
          name="indexReturn"
          label="Annual return"
          addOnSuffix={<FiPercent />}
          placeholder="7"
          defaultValue={user.indexReturn}
        />
      </div>

      <Button
        type="submit"
        className="mt-8 flex w-full flex-row justify-center rounded-md border border-black bg-black p-2 text-center text-sm text-white"
        loading={mutation.isLoading}
      >
        Finish
        <ArrowRightIcon
          className="ml-2 h-4 w-4 self-center"
          aria-hidden="true"
        />
      </Button>
    </Form>
  );
};

export default SimSettings;
