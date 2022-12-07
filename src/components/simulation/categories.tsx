import {
  Button,
  Form,
  NumberInput,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  TextField,
} from "components/ui";
import { AppRouterTypes, trpc } from "utils/trpc";
import _ from "lodash";
import { FiPercent, FiPlus, FiX } from "react-icons/fi";
import { Alert } from "components/ui/Alert";
import EmptyScreen from "components/ui/core/EmptyScreen";
import {
  categoryDataClient,
  CategoryDataInputTypeClient,
  categoryDataServer,
} from "prisma/*";
import { Control, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getCountryLabel,
  getCurrency,
  getCurrencyOptions,
  SelectOption,
  selectOptionsData,
} from "utils/sim-settings";
import { useEffect, useState } from "react";
import showToast from "components/ui/core/notifications";
import { z } from "zod";
import {
  CATEGORY_TYPES,
  DEFAULT_FREQUENCY,
  DEFAULT_FREQUENCY_TYPE,
  CATEGORY_INFL_TYPES,
} from "utils/constants";
import { LabelWithInfo, RecordsList } from "./components";
import { ControlledSelect } from "components/ui/core/form/select/Select";
import useUpdateInflation from "utils/hooks/useUpdateInflation";
import { CountryInflInput, CountrySelect } from "./fields";

type CategoryFormValues = Omit<
  CategoryDataInputTypeClient,
  "currency" | "type" | "inflType" | "country" | "freqType" | "records"
> & {
  currency?: SelectOption;
  type: SelectOption;
  inflType: SelectOption;
  country?: SelectOption;
  freqType?: SelectOption;
  records?: {
    title: string;
    amount: number | string;
    type: SelectOption;
    frequency: string | number;
    inflation: string | number;
    currency: string;
  }[];
};

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="mt-6 mb-8 space-y-6 divide-y">
        <SkeletonText className="h-8 w-full" />
        <div className="flex space-x-3">
          <SkeletonText className="h-8 w-full flex-[1_1_80%]" />
          <SkeletonText className="h-8 w-full" />
        </div>
        <SkeletonText className="h-8 w-full" />

        <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
      </div>
    </SkeletonContainer>
  );
};

const CategoryForm = ({
  category,
}: {
  category?: AppRouterTypes["simulation"]["categories"]["get"]["output"][0];
}) => {
  const [recordsDisabled, setRecordsDisabled] = useState<boolean>(false);
  const [catInflDisabled, setCatInflDisabled] = useState<boolean>(false);
  const [crrRecordType, setCrrRecordType] = useState<SelectOption>();

  // user data
  const {
    data: user,
    isLoading,
    isError,
    error,
    isSuccess,
  } = trpc.user.me.useQuery();

  // form
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(
      categoryDataClient.extend({
        currency: selectOptionsData,
        type: selectOptionsData,
        inflType: selectOptionsData,
        country: selectOptionsData,
        freqType: selectOptionsData,
        records: z
          .array(
            z
              .object({
                title: z.string().optional(),
                amount: z.number().positive(),
                type: selectOptionsData,
                frequency: z.number().positive(),
                inflation: z.number().positive(),
                currency: z.string(),
              })
              .required()
          )
          .optional(),
      })
    ),
    reValidateMode: "onChange",
  });
  const { reset, register, control, formState, setFocus } = categoryForm;
  const { isSubmitting, isDirty } = formState;

  const { updateInflation, isLoadingInfl, isValidInfl } =
    useUpdateInflation<CategoryFormValues>({
      inflName: "inflVal",
    });

  // fieldArray
  const fieldArray = useFieldArray({
    control,
    name: "records",
  });
  const { fields, append, remove } = fieldArray;

  const watchTitleVal = useWatch({
    control,
    name: "title",
  });
  const watchType = useWatch({
    control,
    name: "type",
  });
  const watchFreqType = useWatch({
    control,
    name: "freqType",
  });
  const watchInflType = useWatch({
    control,
    name: "inflType",
  });
  const watchCurrency = useWatch({
    control,
    name: "currency",
  });

  // mutation
  const utils = trpc.useContext();
  const categoryMutation =
    trpc.simulation.categories.createOrUpdate.useMutation({
      onSuccess: async () => {
        showToast("New category added successfully", "success");
        await utils.simulation.categories.invalidate();
      },
      onError: async () => {
        showToast("Could not add category. Please try again", "error");
        await utils.simulation.categories.invalidate();
      },
    });

  // default form values
  useEffect(() => {
    if (category) {
      reset({
        ...category,
        currency: getCurrency(category.currency),
        type: {
          value: category.type,
          label: category.type.toUpperCase(),
        },
        inflType: {
          value: category.inflType,
          label: category.inflType.toUpperCase(),
        },
        country: {
          value: category.country,
          label: getCountryLabel(category.country),
        },
        freqType: {
          value: category.freqType,
          label: category.freqType.toUpperCase(),
        },
        records: category.records.map((record) => ({
          ...record,
          type: {
            value: record.type,
            label: record.type.toUpperCase(),
          },
        })),
      });
    }
  }, [category, reset]);

  // onSubmit
  const onCategorySubmit = (values: CategoryFormValues) => {
    let input = {
      ...values,
      currency: values.currency?.value || user?.currency,
      country: values.country || user?.country,
      inflVal: values.inflVal || user?.inflation,
      icon: values.icon || "Icon",
      freqType: values.freqType || DEFAULT_FREQUENCY_TYPE,
      frequency: values.frequency || DEFAULT_FREQUENCY,
    };
    if (category?.id) {
      input = {
        ...input,
        id: category?.id,
      };
    }

    if (recordsDisabled || (values.records?.length as number) === 0) {
      input = {
        ...input,
        ..._.omit(values, ["records"]),
        currency: values.currency?.value || user?.currency,
      };
    }
    console.log("CATEGORY VALUES", values);

    categoryMutation.mutate(
      input as unknown as z.infer<typeof categoryDataServer>
    );
  };

  const isDisabled = isSubmitting || !isDirty;

  if (isLoading || !user) return <SkeletonLoader />;

  if (isError) {
    return (
      <Alert
        severity="error"
        title="Something went wrong"
        message={error.message}
      />
    );
  }

  if (isSuccess) {
    return (
      <Form<CategoryFormValues>
        form={categoryForm}
        handleSubmit={onCategorySubmit}
        className="space-y-6"
      >
        {/* title */}
        <div>
          <TextField
            label="Title"
            placeholder="Salary"
            {...register("title")}
          />
        </div>

        {/* type */}
        <div>
          <ControlledSelect<CategoryFormValues>
            control={control}
            options={() =>
              CATEGORY_TYPES.map((type) => ({
                value: type,
                label: type.toUpperCase(),
              }))
            }
            name="type"
            label="Type"
          />
        </div>

        <div className="flex space-x-3">
          {/* budget */}
          <div className="flex-[1_1_80%]">
            <NumberInput<CategoryFormValues>
              control={control}
              name="budget"
              label="Budget"
              placeholder="Budget"
            />
          </div>

          {/* currency Select*/}
          <div>
            <ControlledSelect<CategoryFormValues>
              control={control}
              options={getCurrencyOptions}
              name="currency"
              label="Currency"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* inflation label */}
          <LabelWithInfo
            label="Inflation"
            infoCont={
              <>
                Select "Per record" to apply individual inflation to every
                expense record.
                <br />
                Leave it as is to apply same inflation to the whole category.
              </>
            }
          />

          {/* inflType select */}
          <ControlledSelect
            control={control as unknown as Control}
            name="inflType"
            options={() =>
              CATEGORY_INFL_TYPES.map((type) => ({
                value: type,
                label: type === "" ? "Disabled" : type.toUpperCase(),
              }))
            }
            onChange={(e) => {
              console.log("INFLTYPE OPTIONS ONCHANGE", e);
              setCatInflDisabled(e.value === "" || e.value === "perRec");

              return { ...e };
            }}
          />
        </div>

        <div className="flex space-x-3">
          {/* country Select */}
          <div className="flex-[1_1_80%]">
            <CountrySelect<CategoryFormValues>
              form={categoryForm}
              control={control}
              updateInflation={updateInflation}
            />
          </div>

          {/* country inflation */}
          {/* TODO: review this condition */}
          {watchInflType.value === "perCat" &&
            watchType.value === "outcome" && (
              <div>
                {catInflDisabled && (
                  <CountryInflInput<CategoryFormValues>
                    control={control}
                    name="inflVal"
                    isLoadingInfl={isLoadingInfl}
                    isValidInfl={isValidInfl}
                  />
                )}
              </div>
            )}
        </div>

        {/* expenses records */}
        <RecordsList<CategoryFormValues>
          name="records"
          infoCont={
            <>
              Your monthly expenses for {watchTitleVal} category
              <br />
              expressed on a year basis.
              <br />
              Frequency defines how many months per year you expect to
              <br />
              make that expense
            </>
          }
          hidden={recordsDisabled}
          isDisabled={categoryMutation.isLoading}
          fieldArray={fieldArray}
          newRecordShape={{
            title: "",
            amount: "",
            type: {
              value: watchType?.value === "income" ? "income" : "outcome",
              label: watchType?.value === "income" ? "Income" : "Outcome",
            },
            frequency: DEFAULT_FREQUENCY,
            inflation: user.inflation,
            currency: user.currency,
          }}
          switchOnChecked={() => {
            categoryForm.setValue("title", watchTitleVal, {
              shouldDirty: true,
            });

            if (!recordsDisabled) {
              remove();
            } else {
              append({
                title: "",
                amount: "",
                type: {
                  value: watchType?.value === "income" ? "income" : "outcome",
                  label: watchType?.value === "income" ? "Income" : "Outcome",
                },
                frequency: DEFAULT_FREQUENCY,
                inflation: user.inflation,
                currency: user.currency,
              });
            }
          }}
        >
          {(index: number) => (
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
                <NumberInput<CategoryFormValues>
                  control={control}
                  name={`records.${index}.amount`}
                  label="Amount"
                  placeholder=""
                />
              </div>
              {/* <SelectType /> */}
              <div>
                <ControlledSelect<CategoryFormValues>
                  control={control}
                  options={() =>
                    ["income", "outcome"].map((option) => ({
                      value: option,
                      label: option.toUpperCase(),
                    }))
                  }
                  onChange={(option) => {
                    setCrrRecordType(option);

                    return option;
                  }}
                  name={`records.${index}.type`}
                  label="Type"
                />
              </div>
              {/* freqType === 'perRec' => <Frequency /> */}
              {watchFreqType?.value === "perRec" && (
                <div>
                  <NumberInput<CategoryFormValues>
                    control={control}
                    name={`records.${index}.frequency`}
                    label="Frequency"
                    placeholder=""
                    addOnSuffix={<span>p.a.</span>}
                  />
                </div>
              )}
              {/* inflType === 'perRec' && type !== 'income' && records.type !== 'income' => <Inflation /> */}
              {watchInflType?.value === "perRec" &&
                watchType?.value !== "income" &&
                crrRecordType?.value !== "income" && (
                  <div>
                    <NumberInput<CategoryFormValues>
                      control={control}
                      name={`records.${index}.inflation`}
                      label="Inflation"
                      placeholder=""
                      addOnSuffix={<FiPercent />}
                    />
                  </div>
                )}
              {/* currency === 'perRec' => <Currency /> */}
              {watchCurrency?.value === "perRec" && (
                <div>
                  <ControlledSelect<CategoryFormValues>
                    control={control}
                    options={getCurrencyOptions}
                    name={`records.${index}.currency`}
                    label="Currency"
                  />
                </div>
              )}
              <Button
                color="primary"
                disabled={isDisabled}
                className="mt-3"
                onClick={() => remove(index)}
              >
                <FiX className="h-4 w-4" />
              </Button>
            </>
          )}
        </RecordsList>
        <>{console.log("FORM ERRORS", categoryForm.formState.errors)}</>
      </Form>
    );
  }

  // impossible state
  return null;
};

const Categories = () => {
  const [newCategories, setNewCategories] = useState<Array<number | undefined>>(
    []
  );

  const {
    data: categories,
    isLoading,
    isError,
    isSuccess,
    error,
  } = trpc.simulation.categories.get.useQuery();

  if (isLoading) return <SkeletonLoader />;
  if (isError)
    return (
      <Alert
        severity="error"
        title="Something went wrong"
        message={error.message}
      />
    );

  if (isSuccess)
    return (
      <div>
        <Button
          className="mb-4"
          StartIcon={FiPlus}
          onClick={() => setNewCategories([...newCategories, 0])}
        >
          New Category
        </Button>
        <div className="space-y-4">
          {categories?.map((category) => (
            <CategoryForm category={category} />
          ))}
          {newCategories.map(() => (
            <CategoryForm />
          ))}
        </div>
        {categories?.length === 0 && (
          <EmptyScreen
            Icon={FiPlus}
            headline="New category"
            description="Budget categories helps you define all your yearly expenses to fine-tune the simulation's result"
          />
        )}
      </div>
    );

  // impossible state
  return null;
};

export default Categories;
