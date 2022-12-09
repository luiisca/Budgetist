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
import { FiPercent, FiPlus, FiX } from "react-icons/fi";
import { Alert } from "components/ui/Alert";
import EmptyScreen from "components/ui/core/EmptyScreen";
import {
  categoryDataClient,
  CategoryDataInputTypeClient,
  categoryDataServer,
  nonEmptyString,
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
import { useEffect, useReducer, useRef, useState } from "react";
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
  genOption,
  OptionsType,
  TYPES,
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

const recordsInflTypeReducer = (
  recordsInflType: { disabled: boolean; index: number }[],
  action: { type: string; index?: number }
) => {
  switch (action.type) {
    case "ADD": {
      return [
        ...recordsInflType,
        {
          disabled: false,
          index: recordsInflType.length,
        },
      ];
    }
    case "UPDATE": {
      return recordsInflType.map((rec) => {
        if (rec.index === action.index) {
          return {
            disabled: !rec.disabled,
            index: rec.index,
          };
        } else {
          return rec;
        }
      });
    }
    case "REMOVE": {
      return recordsInflType.filter((rec) => rec.index !== action.index);
    }
    case "REMOVE_ALL": {
      return [];
    }

    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
};
const recordsTypeReducer = (
  recordsType: { type: string; index: number }[],
  action: { type: string; catType?: OptionsType; index?: number }
) => {
  switch (action.type) {
    case "ADD": {
      return [
        ...recordsType,
        {
          type: action.catType || "outcome",
          index: recordsType.length,
        },
      ];
    }
    case "UPDATE": {
      return recordsType.map((rec) => {
        if (rec.index === action.index) {
          return {
            type: action.catType || "outcome",
            index: rec.index,
          };
        } else {
          return rec;
        }
      });
    }
    case "REMOVE": {
      return recordsType.filter((rec) => rec.index !== action.index);
    }
    case "REMOVE_ALL": {
      return [];
    }

    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
};

const CategoryForm = ({
  category,
}: {
  category?: AppRouterTypes["simulation"]["categories"]["get"]["output"][0];
}) => {
  const [recordsDisabled, setRecordsDisabled] = useState<boolean>(false);
  const [recordsInflType, dispatchRecordsInflType] = useReducer(
    recordsInflTypeReducer,
    []
  );
  const [recordsType, dispatchRecordsType] = useReducer(recordsTypeReducer, []);

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
                type: selectOptionsData,
                country: selectOptionsData,
                currency: selectOptionsData,
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
    useUpdateInflation<CategoryFormValues>();

  // fieldArray
  const fieldArray = useFieldArray({
    control,
    name: "records",
  });
  const { append, remove } = fieldArray;

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

  const newRecordShapeRef = useRef({
    title: "",
    amount: "",
    type: {
      value: watchType?.value === "income" ? INCOME_VAL : OUTCOME_VAL,
      label: watchType?.value === "income" ? INCOME_LABEL : OUTCOME_LABEL,
    } as SelectOption,
    frequency: DEFAULT_FREQUENCY,
    inflType: recordsInflType[recordsInflType.length - 1]?.disabled || false,
    country: {
      value: category?.country || user?.country,
      label: getCountryLabel(category?.country || (user?.country as string)),
    } as SelectOption,
    inflation: category?.inflVal || (user?.inflation as number),
    currency: getCurrency(category?.currency || (user?.currency as string)),
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
    reset({
      ...category,
      currency: getCurrency(category?.currency || (user?.currency as string)),
      type: {
        value: category?.type || OUTCOME_VAL,
        label: category?.type.toUpperCase() || OUTCOME_LABEL,
      },
      inflType: {
        value: category?.inflType || PER_CAT_VAL,
        label: category?.inflType.toUpperCase() || PER_CAT_LABEL,
      },
      inflVal: category?.inflVal || user?.inflation,
      country: {
        value: category?.country || user?.country,
        label: getCountryLabel(category?.country || (user?.country as string)),
      },
      freqType: {
        value: category?.freqType || PER_CAT_VAL,
        label: category?.freqType.toUpperCase() || PER_CAT_LABEL,
      },
      frequency: DEFAULT_FREQUENCY,
      records: category?.records.map((record) => ({
        ...record,
        title: record.title || "",
        type: {
          value: record.type,
          label: record.type.charAt(0).toUpperCase() + record.type.slice(1),
        },
        currency: {
          value: record.currency,
          label:
            record.currency.charAt(0).toUpperCase() + record.currency.slice(1),
        },
        country: {
          value: record.country || user?.country,
          label: getCountryLabel(record.country || (user?.country as string)),
        },
      })),
    });
  }, [user, category, reset]);

  // onSubmit
  const onCategorySubmit = (values: CategoryFormValues) => {
    let input = {
      ...values,
      currency: values.currency?.value || user?.currency,
      country: values.country || user?.country,
      inflVal: values.inflVal || user?.inflation,
      icon: values.icon || "Icon",
      freqType: values.freqType || PER_CAT_VAL,
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
              options={getCurrencyOptions}
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
          newRecordShape={newRecordShapeRef.current}
          switchOnChecked={() => {
            categoryForm.setValue("title", watchTitleVal, {
              shouldDirty: true,
            });

            if (!recordsDisabled) {
              remove();
              dispatchRecordsInflType({
                type: "REMOVE_ALL",
              });
              dispatchRecordsType({
                type: "REMOVE_ALL",
              });
            } else {
              append(newRecordShapeRef.current);
              dispatchRecordsType({
                type: "ADD",
                catType: watchType.value as OptionsType,
              });
              dispatchRecordsInflType({
                type: "ADD",
              });
            }

            setRecordsDisabled(!recordsDisabled);
          }}
          onAddRecord={() => {
            dispatchRecordsType({
              type: "ADD",
              catType: watchType.value as OptionsType,
            });
            dispatchRecordsInflType({
              type: "ADD",
            });
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
                  options={() => TYPES}
                  onChange={(option) => {
                    dispatchRecordsType({
                      type: "UPDATE",
                      catType: option.value,
                      index,
                    });

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
              <>
                {console.log(
                  "RECORDSINFL TYPE",
                  recordsInflType,
                  recordsInflType[index],
                  "INDEX",
                  index
                )}
              </>
              <>
                {console.log(
                  "RECORDS TYPE",
                  recordsType,
                  recordsType[index],
                  "INDEX",
                  index
                )}
              </>
              {((watchType?.value === "income" &&
                recordsType[index].type === "outcome") ||
                (watchType?.value === "outcome" &&
                  watchInflType?.value === "perRec" &&
                  recordsType[index].type === "outcome")) && (
                <>
                  {/* <Inflation switch /> */}
                  <div className="mb-4 flex items-center space-x-2">
                    <Label>Inflation</Label>
                    <Tooltip
                      content={`${
                        recordsInflType[index].disabled ? "Enable" : "Disable"
                      } inflation`}
                    >
                      <div className="self-center rounded-md p-2 hover:bg-gray-200">
                        <Switch
                          name="Hidden"
                          checked={!recordsInflType[index].disabled}
                          onCheckedChange={() => {
                            dispatchRecordsInflType({
                              type: "UPDATE",
                              index,
                            });
                          }}
                        />
                      </div>
                    </Tooltip>
                  </div>
                  {!recordsInflType[index].disabled && (
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
              <Button
                color="primary"
                disabled={isDisabled}
                className="mt-3"
                onClick={() => {
                  remove(index);
                  dispatchRecordsType({
                    type: "REMOVE",
                    index,
                  });
                  dispatchRecordsInflType({
                    type: "REMOVE",
                    index,
                  });
                }}
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
