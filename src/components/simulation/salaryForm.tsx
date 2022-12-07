import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  NumberInput,
  TextField,
  transIntoInt,
} from "components/ui";
import { ControlledSelect } from "components/ui/core/form/select/Select";
import showToast from "components/ui/core/notifications";
import _ from "lodash";
import {
  salaryDataClient,
  salaryDataServer,
  SalaryDataInputTypeClient,
} from "prisma/*";
import { useEffect, useState } from "react";
import {
  Control,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { FiX } from "react-icons/fi";
import {
  getCurrency,
  getCurrencyOptions,
  SelectOption,
  selectOptionsData,
} from "utils/sim-settings";
import { trpc } from "utils/trpc";
import { z } from "zod";
import { RecordsList } from "./components";

type SalaryFormValues = Omit<SalaryDataInputTypeClient, "currency"> & {
  currency?: SelectOption;
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
  const { setError, clearErrors } = useFormContext();
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
        clearErrors(`variance.${index}.from`);
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

const SalaryForm = () => {
  const [varianceHidden, setVarianceHidden] = useState<boolean>(false);
  const { data: user } = trpc.user.me.useQuery();

  // form
  const salaryForm = useForm<SalaryFormValues>({
    resolver: zodResolver(
      salaryDataClient.extend({
        currency: selectOptionsData,
      })
    ),
    reValidateMode: "onChange",
  });
  const { reset, register, control, formState, setFocus } = salaryForm;
  const { isSubmitting, isDirty } = formState;

  // watch values
  const fieldArray = useFieldArray<SalaryFormValues>({
    control,
    name: "variance",
  });
  const { fields, append, remove } = fieldArray;

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

  // mutation
  const utils = trpc.useContext();
  const salaryMutation = trpc.simulation.salary.updateOrCreate.useMutation({
    onSuccess: async () => {
      showToast("Salary updated successfully", "success");
      await utils.user.me.invalidate();
    },
    onError: async (e) => {
      const [message, inputIndex] = e.message.split(",");
      setFocus(`variance.${Number(inputIndex)}.from`);
      showToast(message, "error");
      await utils.user.me.invalidate();
    },
  });

  // default form values
  useEffect(() => {
    if (user) {
      const salary = user.salary;
      reset({
        title: salary?.title,
        currency: getCurrency(salary?.currency as string),
        amount: salary?.amount,
        variance: salary?.variance,
      });
    }
  }, [reset, user]);

  // onSubmit
  const onSalarySubmit = (values: SalaryFormValues) => {
    let input;
    if (!varianceHidden && (values.variance?.length as number) > 0) {
      input = {
        ...values,
        currency: values.currency?.value || user?.currency,
      };
    } else {
      input = {
        ..._.omit(values, ["variance"]),
        currency: values.currency?.value || user?.currency,
      };
    }

    salaryMutation.mutate(input as unknown as z.infer<typeof salaryDataServer>);
  };

  const isDisabled = isSubmitting || !isDirty;

  return (
    <Form<SalaryFormValues>
      form={salaryForm}
      handleSubmit={onSalarySubmit}
      className="space-y-6"
    >
      <div>
        <TextField label="Title" placeholder="Salary" {...register("title")} />
      </div>
      <div className="flex space-x-3">
        {/* amount  */}
        <div className="flex-[1_1_80%]">
          <NumberInput<SalaryFormValues>
            control={control}
            name="amount"
            label="Salary"
            placeholder="Current salary..."
          />
        </div>
        {/* currency */}
        <div>
          <ControlledSelect<SalaryFormValues>
            control={control}
            options={getCurrencyOptions}
            name="currency"
            label="Currency"
          />
        </div>
      </div>

      <RecordsList<SalaryFormValues>
        name="variance"
        infoCont={
          <>
            Your salary increase over time.
            <br />
            Input the starting year and how much you expect to make <br /> until
            the next period.
          </>
        }
        hidden={varianceHidden}
        isDisabled={salaryMutation.isLoading}
        fieldArray={fieldArray}
        newRecordShape={{
          from: Number(watchLatestFromVal) + 1 || 1,
          amount: watchAmountVal,
        }}
        switchOnChecked={() => {
          salaryForm.setValue("amount", watchAmountVal, { shouldDirty: true });

          if (!varianceHidden) {
            remove();
          } else {
            append({
              from: 1,
              amount: watchAmountVal,
            });
          }
          setVarianceHidden(!varianceHidden);
        }}
      >
        {(index: number) => (
          <>
            <PeriodInput
              position={index}
              label="From"
              control={control as unknown as Control}
              name={`variance.${index}.from`}
              varianceArr={watchVarianceArr}
            />
            <PeriodInput
              position={index}
              label="Amount"
              control={control as unknown as Control}
              name={`variance.${index}.amount`}
            />
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

      <Button
        type="submit"
        disabled={isDisabled}
        color="primary"
        className="mt-6"
        loading={salaryMutation.isLoading}
      >
        Update
      </Button>
    </Form>
  );
};

export default SalaryForm;
