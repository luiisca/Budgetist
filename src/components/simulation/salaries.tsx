import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  NumberInput,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  TextField,
  transIntoInt,
} from "components/ui";
import { Alert } from "components/ui/Alert";
import EmptyScreen from "components/ui/core/EmptyScreen";
import { ControlledSelect } from "components/ui/core/form/select/Select";
import showToast from "components/ui/core/notifications";
import { Dialog, DialogContent, DialogTrigger } from "components/ui/Dialog";
import _ from "lodash";
import { BalanceContext } from "pages/simulation";
import {
  salaryDataClient,
  salaryDataServer,
  SalaryDataInputTypeClient,
} from "prisma/*";
import React from "react";
import { useContext, useEffect, useState } from "react";
import {
  Control,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  FiAlertTriangle,
  FiPercent,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import {
  BASIC_GROUP_TYPES,
  DEFAULT_TAX_PERCENT,
  getLabel,
  OptionsType,
  PER_CAT_LABEL,
  PER_CAT_VAL,
} from "utils/constants";
import { getCurrency, getCurrencyOptions } from "utils/sim-settings";
import { AppRouterTypes, trpc } from "utils/trpc";
import { z } from "zod";
import { RecordsList } from "./components";
import { useSimData } from "./hooks";

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="mt-6 mb-8 space-y-6">
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

const PeriodInput = ({
  control,
  position,
  label,
  name,
  varianceArr,
}: {
  control: Control;
  position: number;
  label: string;
  name: string;
  varianceArr?: {
    from: number | string;
    amount: number | string;
  }[];
}) => {
  const {
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext();

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const crrParsedInput = transIntoInt(e.target.value);

    if (!varianceArr) return crrParsedInput;

    // validate custom validations for all array fields on every keystroke
    varianceArr.reduce((prev, crr, index) => {
      // use crrParsedInput when validating neighbors as new val is not yet registered by useWatch
      const prevFromVal = position === index - 1 ? crrParsedInput : prev?.from;
      const crrFromVal = position === index ? crrParsedInput : crr.from;
      const nextFromVal =
        position === index + 1
          ? crrParsedInput
          : varianceArr[index + 1] && varianceArr[index + 1].from;

      if (crrFromVal === "") {
        setError(`variance.${index}.from`, {
          message: "Cannot be empty",
        });
      } else if (nextFromVal && crrFromVal >= nextFromVal) {
        setError(`variance.${index}.from`, {
          message: "Must be less than next period",
        });
      } else if (prevFromVal && crrFromVal <= prevFromVal) {
        setError(`variance.${index}.from`, {
          message: "Must be greater than previous period",
        });
      } else {
        errors && clearErrors(`variance.${index}.from`);
      }
      return crr;
    }, {} as { from: number; amount: number });

    return crrParsedInput;
  };

  return (
    <NumberInput
      label={label}
      control={control}
      name={name}
      onChange={onChangeHandler}
    />
  );
};

const SalaryForm = ({
  onRemove,
  salary,
}: {
  onRemove?: () => void;
  salary?: AppRouterTypes["simulation"]["salaries"]["get"]["output"][0];
}) => {
  const {
    userResult: { data: user, isLoading, isError, isSuccess, error },
    balanceDispatch,
  } = useSimData();

  const [varianceHidden, setVarianceHidden] = useState<boolean>(false);

  const [deleteSalaryOpen, setDeleteSalaryOpen] = useState(false);

  // form
  const salaryForm = useForm<SalaryDataInputTypeClient>({
    resolver: zodResolver(salaryDataClient),
    reValidateMode: "onChange",
  });
  const { reset, register, control, formState, setFocus } = salaryForm;
  const { isSubmitting, isDirty } = formState;

  const fieldArray = useFieldArray<SalaryDataInputTypeClient>({
    control,
    name: "variance",
  });
  const { fields, append, remove } = fieldArray;

  // watch values
  const watchLatestFromVal = useWatch({
    control,
    name: `variance.${fields.length - 1}.from`,
  });

  const watchVarianceArr = useWatch({
    control,
    name: "variance",
  });

  const watchAmountVal = useWatch({
    control,
    name: "amount",
  });

  const watchTaxType = useWatch({
    control,
    name: "taxType",
  });

  // mutation
  const utils = trpc.useContext();
  const salaryMutation = trpc.simulation.salaries.createOrUpdate.useMutation({
    onMutate: () => {
      balanceDispatch({
        type: "TOTAL_BAL_LOADING",
        loading: true,
      });
    },
    onSuccess: async () => {
      showToast(
        `Salary ${salary?.id ? "updated" : "created"} successfully`,
        "success"
      );
      await utils.simulation.salaries.invalidate();
      onRemove && onRemove();
    },
    onError: async (e) => {
      const [message, inputIndex] = e.message.split(",");
      setFocus(`variance.${Number(inputIndex)}.from`);
      showToast(message, "error");
      await utils.simulation.salaries.invalidate();
      onRemove && onRemove();
    },
  });

  // default form values
  useEffect(() => {
    reset({
      title: salary?.title,
      currency: getCurrency(
        salary?.currency || (user?.currency as string),
        user?.country
      ),
      amount: salary?.amount,
      taxType: {
        value: salary?.taxType || PER_CAT_VAL,
        label:
          (salary?.taxType && getLabel(salary?.taxType as OptionsType)) ||
          PER_CAT_LABEL,
      },
      taxPercent: salary?.taxPercent || DEFAULT_TAX_PERCENT,
      variance: salary?.variance.map((period) => ({
        ...period,
        taxPercent: period.taxPercent || DEFAULT_TAX_PERCENT,
      })),
    });
  }, [user, reset, salary]);

  // onSubmit
  const onSalarySubmit = (values: SalaryDataInputTypeClient) => {
    let input;
    if (!varianceHidden && (values.variance?.length as number) > 0) {
      input = {
        ...values,
        variance: values.variance?.map((period) => ({
          ...period,
          taxPercent: period.taxPercent || DEFAULT_TAX_PERCENT,
        })),
      };
    } else {
      input = {
        ..._.omit(values, ["variance"]),
      };
    }
    input = {
      ...input,
      currency: values.currency?.value || user?.currency,
      taxType: values.taxType.value || PER_CAT_VAL,
      taxPercent: values.taxPercent || DEFAULT_TAX_PERCENT,
    };
    if (salary?.id) {
      input = {
        ...input,
        id: salary?.id,
      };
    }

    salaryMutation.mutate(input as unknown as z.infer<typeof salaryDataServer>);
  };

  // deleteMutation
  const deleteSalaryMutation = trpc.simulation.salaries.delete.useMutation({
    onMutate: () => {
      balanceDispatch({
        type: "TOTAL_BAL_LOADING",
        loading: true,
      });
    },
    onSuccess: async () => {
      showToast("Salary deleted", "success");
      await utils.simulation.salaries.invalidate();
    },
    onError: async () => {
      showToast("Could not delete salary. Please try again.", "error");
      await utils.simulation.salaries.invalidate();
    },
    async onSettled() {
      await utils.simulation.salaries.invalidate();
    },
  });
  const transInt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedVal = parseInt(value as string, 10);
    return parsedVal <= 0
      ? 0
      : Number.isNaN(parsedVal)
      ? ""
      : parsedVal > 100
      ? 100
      : parseInt(value as string, 10);
  };

  const isDisabled = isSubmitting || !isDirty;

  if (isLoading || !user) return <SkeletonLoader />;

  if (isError)
    return (
      <Alert
        severity="error"
        title="Something went wrong"
        message={error?.message}
      />
    );

  if (isSuccess)
    return (
      <Form<SalaryDataInputTypeClient>
        form={salaryForm}
        handleSubmit={onSalarySubmit}
        className="space-y-6"
      >
        <div>
          <TextField
            label="Title"
            placeholder="Salary"
            {...register("title")}
          />
        </div>
        <div className="flex space-x-3">
          {/* amount  */}
          <div className="flex-[1_1_60%]">
            <NumberInput<SalaryDataInputTypeClient>
              control={control}
              name="amount"
              label="Yearly Salary"
              placeholder="Current salary..."
            />
          </div>
          {/* taxType */}
          <div>
            <ControlledSelect<SalaryDataInputTypeClient>
              control={control}
              options={() => BASIC_GROUP_TYPES}
              name="taxType"
              label="Tax Type"
            />
          </div>
          {/* income tax */}
          {watchTaxType?.value === "perCat" && (
            <div>
              <NumberInput<SalaryDataInputTypeClient>
                control={control}
                name="taxPercent"
                label="Income Taxes"
                addOnSuffix={<FiPercent />}
                placeholder={`${DEFAULT_TAX_PERCENT}`}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  const parsedVal = parseInt(value as string, 10);
                  return parsedVal <= 0
                    ? 0
                    : Number.isNaN(parsedVal)
                    ? ""
                    : parsedVal > 100
                    ? 100
                    : parseInt(value as string, 10);
                }}
              />
            </div>
          )}
          {/* currency */}
          <div>
            <ControlledSelect<SalaryDataInputTypeClient>
              control={control}
              options={getCurrencyOptions}
              name="currency"
              label="Currency"
            />
          </div>
        </div>

        <RecordsList<SalaryDataInputTypeClient>
          name="variance"
          infoCont={
            <>
              Your salary increase over time.
              <br />
              Input the starting year and how much you expect to make <br />{" "}
              until the next period.
            </>
          }
          hidden={varianceHidden}
          isDisabled={salaryMutation.isLoading}
          fieldArray={fieldArray}
          newRecordShape={{
            from: Number(watchLatestFromVal) + 1 || 1,
            amount: watchAmountVal,
            taxPercent: DEFAULT_TAX_PERCENT,
          }}
          switchOnChecked={() => {
            salaryForm.setValue("amount", watchAmountVal, {
              shouldDirty: true,
            });

            if (!varianceHidden) {
              remove();
            } else {
              append({
                from: 1,
                amount: watchAmountVal,
                taxPercent: DEFAULT_TAX_PERCENT,
              });
            }
            setVarianceHidden(!varianceHidden);
          }}
        >
          {(index: number) => (
            <>
              {/* period */}
              <PeriodInput
                position={index}
                label="From"
                control={control as unknown as Control}
                name={`variance.${index}.from`}
                varianceArr={watchVarianceArr}
              />
              {/* amount */}
              <NumberInput
                control={control as unknown as Control}
                name={`variance.${index}.amount`}
                label="Amount"
              />
              {/* taxes */}
              {watchTaxType?.value === "perRec" && (
                <div>
                  <NumberInput<SalaryDataInputTypeClient>
                    control={control}
                    name={`variance.${index}.taxPercent`}
                    label="Income Taxes"
                    addOnSuffix={<FiPercent />}
                    placeholder={`${DEFAULT_TAX_PERCENT}`}
                    onChange={transInt}
                    value={transInt}
                  />
                </div>
              )}
              <Button
                color="primary"
                className="mt-3"
                onClick={() => remove(index)}
              >
                <FiX className="h-4 w-4" />
              </Button>
            </>
          )}
        </RecordsList>

        <div className="flex items-center space-x-2 pt-3">
          <Button
            type="submit"
            disabled={isDisabled}
            color="primary"
            loading={salaryMutation.isLoading}
          >
            {salary ? "Update" : "Create"}
          </Button>
          {salary ? (
            <Dialog open={deleteSalaryOpen} onOpenChange={setDeleteSalaryOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  color="destructive"
                  className="border-2 px-3 font-normal"
                  StartIcon={() => <FiTrash2 className="m-0" />}
                />
              </DialogTrigger>
              <DialogContent
                title="Delete Salary"
                description="Are you sure you want to delete the current salary?"
                type="confirmation"
                actionText="Delete salary"
                Icon={FiAlertTriangle}
                actionOnClick={(e) =>
                  e &&
                  ((e: Event | React.MouseEvent<HTMLElement, MouseEvent>) => {
                    e.preventDefault();
                    deleteSalaryMutation.mutate({ id: salary.id });
                  })(e)
                }
              />
            </Dialog>
          ) : (
            <Button
              onClick={() => {
                onRemove && onRemove();
              }}
              type="button"
              color="destructive"
              className="border-2 px-3 font-normal"
              StartIcon={() => <FiTrash2 className="m-0" />}
            />
          )}
        </div>
      </Form>
    );

  // impossible state
  return null;
};

const Salaries = () => {
  const {
    salariesResult: { data: salaries, isLoading, isError, isSuccess, error },
  } = useContext(BalanceContext);
  const [newSalaries, setNewSalaries] = useState<
    Array<Record<string, unknown>>
  >([]);
  const [salariesAnimationParentRef] = useAutoAnimate<HTMLDivElement>();

  if (isLoading) return <SkeletonLoader />;
  if (isError)
    return (
      <Alert
        severity="error"
        title="Something went wrong"
        message={error?.message}
      />
    );

  if (isSuccess)
    return (
      <div>
        <Button
          className="mb-4"
          StartIcon={FiPlus}
          onClick={() => setNewSalaries([...newSalaries, {}])}
        >
          New Salary
        </Button>
        <div className="mb-4 space-y-12" ref={salariesAnimationParentRef}>
          {newSalaries.map((_, i) => (
            <SalaryForm
              key={i}
              onRemove={() =>
                setNewSalaries([
                  ...newSalaries.slice(0, i),
                  ...newSalaries.slice(i + 1),
                ])
              }
            />
          ))}
          {salaries?.map((salary, i) => (
            <SalaryForm key={i} salary={salary} />
          ))}
        </div>
        {salaries?.length === 0 && newSalaries?.length === 0 && (
          <EmptyScreen
            Icon={FiPlus}
            headline="New salary"
            description="Moonlighting? We got you covered"
          />
        )}
      </div>
    );

  // impossible state
  return null;
};

export default Salaries;
