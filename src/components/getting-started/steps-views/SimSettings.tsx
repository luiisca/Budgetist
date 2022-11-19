import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { Button, Form, Label, NumberInput, TextField } from "components/ui";
import Select from "components/ui/core/form/select";
import showToast from "components/ui/core/notifications";
import { useRouter } from "next/router";
import { profileData, ProfileDataInputType } from "prisma/*";
import { Controller, useForm } from "react-hook-form";
import { FiCheck, FiGlobe, FiPercent } from "react-icons/fi";
import { trpc } from "utils/trpc";
import { z } from "zod";
import * as countries from "country-flag-icons/react/3x2";
import { useMemo } from "react";
import { components as reactSelectComponents } from "react-select";
import classNames from "classnames";
import { FLAG_URL } from "utils/constants";

interface CountryOption {
  readonly value: string;
  readonly label: string;
}
type FormValues = Omit<ProfileDataInputType, "country"> & {
  country?: CountryOption;
};

const SimSettings = ({ user }: { user: User }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(
      profileData.extend({
        country: z.object({
          value: z.string().optional(),
          label: z.string().optional(),
        }),
      })
    ),
    reValidateMode: "onChange",
    defaultValues: {
      country: { value: user.country, label: user.country },
      inflation: user.inflation || 0,
      currency: user.currency || "",
      investPerc: user.investPerc || 0,
      indexReturn: user.indexReturn || 0,
    },
  });
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
  const countryOptions = useMemo(() => {
    let options: CountryOption[] = [];
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    const countriesArr: string[] = [];
    for (const option in countries) {
      console.log(option);
      countriesArr.push(option);
      options.push({
        value: option, // 'PE'
        label:
          option !== "default"
            ? new Intl.DisplayNames(option, { type: "region" }).of(option) || ""
            : "Other",
      });
    }
    return options;
  }, []);

  return (
    <Form<FormValues>
      form={form}
      handleSubmit={(values) => {
        mutation.mutate({
          ...values,
          country: values.country?.value,
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
                onChange={(e) => e && form.setValue("country", { ...e })}
                components={{
                  Option: (props) => (
                    <reactSelectComponents.Option
                      {...props}
                      className={classNames(
                        "!flex !cursor-pointer !items-center !py-3 dark:bg-darkgray-100",
                        props.isFocused && "!bg-gray-100 dark:!bg-darkgray-200",
                        props.isSelected &&
                          "!bg-neutral-900 dark:!bg-darkgray-300"
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
                  ),
                }}
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
          placeholder="8"
          defaultValue={user.inflation}
        />
      </div>

      {/* currency */}
      <div>
        <TextField
          label="Country Currency"
          placeholder="PEN"
          defaultValue={user.currency}
          {...form.register("currency")}
        />
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
