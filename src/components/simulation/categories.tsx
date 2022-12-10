import {
  Button,
  Form,
  Label,
  NumberInput,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  TextField,
  Tooltip,
} from "components/ui";
import { AppRouterTypes, trpc } from "utils/trpc";
import _ from "lodash";
import { FiPlus, FiX } from "react-icons/fi";
import { Alert } from "components/ui/Alert";
import EmptyScreen from "components/ui/core/EmptyScreen";
import {
  categoryDataClient,
  CategoryDataInputTypeClient,
  categoryDataServer,
  nonEmptyString,
} from "prisma/*";
import {
  Control,
  useFieldArray,
  UseFieldArrayReturn,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
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
  DEFAULT_FREQUENCY,
  CATEGORY_INFL_TYPES,
  FREQUENCY_TYPES,
  PER_CAT_VAL,
  PER_CAT_LABEL,
  OUTCOME_VAL,
  OUTCOME_LABEL,
  INCOME_VAL,
  INCOME_LABEL,
  TYPES,
  getLabel,
  OptionsType,
} from "utils/constants";
import { LabelWithInfo, RecordsList } from "./components";
import { ControlledSelect } from "components/ui/core/form/select/Select";
import useUpdateInflation from "utils/hooks/useUpdateInflation";
import { CountryInflInput, CountrySelect } from "./fields";
import Switch from "components/ui/core/Switch";

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
    title: string | undefined;
    amount: number | string;
    type: SelectOption;
    frequency: string | number;
    inflType: boolean;
    country: SelectOption;
    inflation: string | number;
    currency: SelectOption;
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

const Record = ({
  index,
  fieldArray,
}: {
  index: number;
  fieldArray: UseFieldArrayReturn<CategoryFormValues>;
}) => {
  const [inflDisabled, setInflDisabled] = useState(false);
  const categoryForm = useFormContext<CategoryFormValues>();
  const { register, control } = categoryForm;
  const { remove } = fieldArray;

  const { updateInflation, isLoadingInfl, isValidInfl } =
    useUpdateInflation<CategoryFormValues>();

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

  const watchRecordType = useWatch({
    control,
    name: `records.${index}.type`,
  });

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
          options={() => TYPES}
          onChange={(option) => {
            setInflDisabled(option.value === "income");

            return option;
          }}
          name={`records.${index}.type`}
          label="Type"
        />
      </div>
      {((watchType?.value === "income" &&
        watchRecordType?.value === "outcome") ||
        (watchType?.value === "outcome" &&
          watchInflType?.value === "perRec" &&
          watchRecordType?.value === "outcome")) && (
        <>
          {/* <Inflation switch /> */}
          <div className="mb-4 flex items-center space-x-2">
            <Label>Inflation</Label>
            <Tooltip
              content={`${inflDisabled ? "Enable" : "Disable"} inflation`}
            >
              <div className="self-center rounded-md p-2 hover:bg-gray-200">
                <Switch
                  name="Hidden"
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
                <CountrySelect<CategoryFormValues>
                  form={categoryForm}
                  name={`records.${index}.country`}
                  control={control}
                  updateInflation={updateInflation}
                  inflName={`records.${index}.inflation`}
                />
              </div>

              {/* country inflation */}
              <div>
                <CountryInflInput<CategoryFormValues>
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
        className="mt-3"
        onClick={() => {
          remove(index);
        }}
      >
        <FiX className="h-4 w-4" />
      </Button>
    </>
  );
};

const CategoryForm = ({
  category,
}: {
  category?: AppRouterTypes["simulation"]["categories"]["get"]["output"][0];
}) => {
  const [recordsDisabled, setRecordsDisabled] = useState<boolean>(false);

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
                amount: nonEmptyString.or(z.number().positive()),
                frequency: nonEmptyString.or(z.number().positive()).optional(), // pass default // must be between 1 & 12
                inflType: z.boolean(),
                inflation: z.string().or(z.number().positive()).optional(), // parent default
                type: selectOptionsData,
                country: selectOptionsData,
                currency: selectOptionsData.optional(),
              })
              .required()
          )
          .optional(),
      })
    ),
    reValidateMode: "onChange",
  });
  const { reset, register, control } = categoryForm;

  const { updateInflation, isLoadingInfl, isValidInfl } =
    useUpdateInflation<CategoryFormValues>();

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
  const watchLatestRecordInflType = useWatch({
    control,
    name: `records.${fields.length - 1}.type`,
  });

  const newRecordShape = {
    title: "",
    amount: "",
    type: {
      value: watchType?.value === "income" ? INCOME_VAL : OUTCOME_VAL,
      label: watchType?.value === "income" ? INCOME_LABEL : OUTCOME_LABEL,
    } as SelectOption,
    frequency: DEFAULT_FREQUENCY,
    inflType: watchLatestRecordInflType?.value !== "income",
    country: {
      value: category?.country || user?.country,
      label: getCountryLabel(category?.country || (user?.country as string)),
    } as SelectOption,
    inflation: category?.inflVal || (user?.inflation as number),
    currency: getCurrency(category?.currency || (user?.currency as string)),
  };

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
    reset({
      ...category,
      currency: getCurrency(category?.currency || (user?.currency as string)),
      type: {
        value: category?.type || OUTCOME_VAL,
        label: getLabel(category?.type as OptionsType) || OUTCOME_LABEL,
      },
      inflType: {
        value: category?.inflType || PER_CAT_VAL,
        label: getLabel(category?.inflType as OptionsType) || PER_CAT_LABEL,
      },
      inflVal: category?.inflVal || user?.inflation,
      country: {
        value: category?.country || user?.country,
        label: getCountryLabel(category?.country || (user?.country as string)),
      },
      freqType: {
        value: category?.freqType || PER_CAT_VAL,
        label: getLabel(category?.freqType as OptionsType) || PER_CAT_LABEL,
      },
      frequency: DEFAULT_FREQUENCY,
      records: category?.records.map((record) => ({
        ...record,
        title: record.title || "",
        type: {
          value: record.type,
          label: getLabel(record.type as OptionsType),
        },
        country: {
          value: record.country || user?.country,
          label: getCountryLabel(record.country || (user?.country as string)),
        },
        inflation: record.inflation || user?.inflation,
        currency: getCurrency(record.currency || (user?.currency as string)),
      })),
    });
  }, [user, category, reset]);

  // onSubmit
  const onCategorySubmit = (values: CategoryFormValues) => {
    let selectInputsData = {
      currency: values.currency?.value || user?.currency,
      type: values.type.value,
      inflType: values.inflType?.value,
      country: values.country?.value || user?.country,
      inflVal: values.inflVal || user?.inflation,
      icon: values.icon || "Icon",
      records: values.records?.map((record) => ({
        ...record,
        type: record.type.value,
        frequency: record.frequency || DEFAULT_FREQUENCY,
        country: record.country.value || user?.country,
        inflation: record.inflation || user?.inflation,
        currency: record.currency.value || user?.currency,
      })),
      freqType: values.freqType?.value || PER_CAT_VAL,
      frequency: values.frequency || DEFAULT_FREQUENCY,
    };
    let input = {
      ...values,
      ...selectInputsData,
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
        ..._.omit(selectInputsData, ["records"]),
      };
    }
    console.log("CATEGORY VALUES");
    console.table(values);

    categoryMutation.mutate(
      input as unknown as z.infer<typeof categoryDataServer>
    );
  };

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
          <TextField label="Title" placeholder="Rent" {...register("title")} />
        </div>

        {/* type */}
        <div>
          <ControlledSelect<CategoryFormValues>
            control={control}
            options={() => TYPES}
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
              options={() => getCurrencyOptions("perRec")}
              name="currency"
              label="Currency"
            />
          </div>
        </div>

        {watchType?.value === "outcome" && (
          <>
            <div>
              {/* inflation label */}
              <LabelWithInfo
                label="Inflation"
                infoCont={
                  <>
                    Select "Per record" to apply individual inflation to every
                    expense record.
                    <br />
                    Leave it as is to apply same inflation to the whole
                    category.
                  </>
                }
              />

              {/* inflType select */}
              <ControlledSelect
                control={control as unknown as Control}
                name="inflType"
                options={() => CATEGORY_INFL_TYPES}
              />
            </div>

            {watchType?.value === "outcome" &&
              watchInflType?.value === "perCat" && (
                <div className="flex space-x-3">
                  {/* country Select */}
                  <div className="flex-[1_1_80%]">
                    <CountrySelect<CategoryFormValues>
                      form={categoryForm}
                      name="country"
                      control={control}
                      updateInflation={updateInflation}
                      inflName="inflation"
                    />
                  </div>

                  {/* country inflation */}
                  <div>
                    <CountryInflInput<CategoryFormValues>
                      control={control}
                      name="inflation"
                      isLoadingInfl={isLoadingInfl}
                      isValidInfl={isValidInfl}
                    />
                  </div>
                </div>
              )}
          </>
        )}
        {/* frequency type */}
        <div>
          <ControlledSelect<CategoryFormValues>
            control={control}
            options={() => FREQUENCY_TYPES}
            name="freqType"
            label="Frequency Type"
          />
        </div>
        {/* frequency */}
        {watchFreqType?.value === "perCat" && (
          <div className="flex-[1_1_80%]">
            <NumberInput<CategoryFormValues>
              control={control}
              name="frequency"
              label="Frequency"
              placeholder={`${DEFAULT_FREQUENCY}`}
            />
          </div>
        )}

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
          newRecordShape={newRecordShape}
          switchOnChecked={() => {
            categoryForm.setValue("title", watchTitleVal, {
              shouldDirty: true,
            });

            if (!recordsDisabled) {
              remove();
            } else {
              append(newRecordShape);
            }

            setRecordsDisabled(!recordsDisabled);
          }}
        >
          {(index: number) => <Record index={index} fieldArray={fieldArray} />}
        </RecordsList>

        <Button
          type="submit"
          color="primary"
          disabled={categoryMutation.isLoading}
          className="mt-3"
        >
          {category ? "Update" : "Create"}
        </Button>
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
        <div className="mb-4 space-y-4">
          {categories?.map((category) => (
            <CategoryForm category={category} />
          ))}
          {newCategories.map(() => (
            <CategoryForm />
          ))}
        </div>
        {categories?.length === 0 && newCategories?.length === 0 && (
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
