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
  transIntoInt,
} from "components/ui";
import { useEffect, useState } from "react";
import Head from "next/head";
import Shell from "components/ui/core/Shell";
import {
  Control,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form";
import {
  salaryData,
  SalaryDataInputType,
  salaryVarianceNumber,
} from "prisma/*";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc } from "utils/trpc";
import { CurrencyInput } from "components/getting-started/steps-views/components";
import {
  getCurrency,
  SelectOption,
  selectOptionsData,
} from "utils/sim-settings";
import Switch from "components/ui/core/Switch";
import { FiInfo, FiPlus, FiX } from "react-icons/fi";
import showToast from "components/ui/core/notifications";
import _ from "lodash";
import { z } from "zod";

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
    id: number;
    from: number;
    amount: number;
    salaryId: number;
  }[];
}) => {
  const { setError, clearErrors } = useFormContext();
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const crrParsedInput = transIntoInt(e.target.value);

    if (!varianceArr) return crrParsedInput;

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
    }, {} as { id: number; from: number; amount: number; salaryId: number });

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

const Variance = ({
  varianceHidden,
  setVarianceHidden,
  isDisabled,
}: {
  varianceHidden: boolean;
  setVarianceHidden: (value: boolean) => void;
  isDisabled: boolean;
}) => {
  const form = useFormContext();
  const {
    control,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variance",
  });

  const watchLatestFromVal = useWatch({
    control,
    name: `variance.${fields.length - 1}.from`,
  });
  const watchSalaryVal = useWatch({
    control,
    name: "amount",
  });
  const watchVarianceArr = useWatch({
    control,
    name: "variance",
  });

  useEffect(() => {
    if (errors.variance && errors.variance.message) {
      showToast(errors.variance.message as string, "error");
    }
  }, [errors.variance]);

  return (
    <div>
      <div className="mb-4 flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Label className="mb-0">Variance</Label>
          <Tooltip
            content={
              <p className="text-center">
                Your salary increase over time.
                <br />
                Input the starting year and how much you expect to make <br />{" "}
                until the next period.
              </p>
            }
          >
            <div className="-ml-1 self-center rounded p-2 hover:bg-gray-200">
              <FiInfo className="h-3 w-3" />
            </div>
          </Tooltip>
        </div>
        <Tooltip
          content={`${varianceHidden ? "Add" : "Remove"} variance periods`}
        >
          <div className="self-center rounded-md p-2 hover:bg-gray-200">
            <Switch
              name="Hidden"
              checked={!varianceHidden}
              onCheckedChange={() => {
                form.setValue("salary", watchSalaryVal, { shouldDirty: true });

                if (!varianceHidden) {
                  remove();
                } else {
                  append({
                    from: 1,
                    amount: watchSalaryVal,
                  });
                }

                setVarianceHidden(!varianceHidden);
              }}
            />
          </div>
        </Tooltip>
      </div>
      {!varianceHidden && (
        <>
          <ul className="space-y-4">
            {fields.map((field, index) => (
              <li key={field.id}>
                <div className="flex items-center space-x-3" key={index}>
                  <PeriodInput
                    position={index}
                    label="From"
                    control={control}
                    name={`variance.${index}.from`}
                    varianceArr={watchVarianceArr}
                  />
                  <PeriodInput
                    position={index}
                    label="Amount"
                    control={control}
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
                </div>
              </li>
            ))}
          </ul>
          <Button
            color="primary"
            disabled={isDisabled}
            className="mt-3"
            onClick={() => {
              append({
                from: Number(watchLatestFromVal) + 1 || 1,
                amount: watchSalaryVal,
              });
            }}
          >
            <FiPlus className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

type SalaryFormValues = Omit<SalaryDataInputType, "currency"> & {
  currency?: SelectOption;
};

export default function Simulation() {
  const { data: user, isLoading } = trpc.user.me.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const [varianceHidden, setVarianceHidden] = useState<boolean>(false);

  const salaryForm = useForm<SalaryFormValues>({
    resolver: zodResolver(
      salaryData.extend({
        currency: selectOptionsData,
      })
    ),
    reValidateMode: "onChange",
  });
  const { reset, register, control, formState, setFocus } = salaryForm;
  const { isSubmitting, isDirty } = formState;

  const utils = trpc.useContext();
  const salaryMutation = trpc.simulation.updateOrCreateSalary.useMutation({
    onSuccess: async () => {
      showToast("Salary updated successfully", "success");
      await utils.simulation.invalidate();
    },
    onError: async (e) => {
      const [message, inputIndex] = e.message.split(",");
      setFocus(`variance.${Number(inputIndex)}.from`);
      showToast(message, "error");
      await utils.simulation.invalidate();
    },
  });

  // const yearsEl = useRef<HTMLInputElement>(null);
  // const [balance, setBalance] = useState<number>(salary.amount);

  const onSalarySubmit = (values: SalaryFormValues) => {
    let input;
    if (!varianceHidden) {
      input = {
        ...values,
        variance: values.variance as unknown as z.infer<
          typeof salaryVarianceNumber
        >,
        currency: values.currency?.value,
      };
    } else {
      input = {
        ..._.omit(values, ["variance"]),
        currency: values.currency?.value,
      };
    }

    return salaryMutation.mutate(input);
  };

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

  const isDisabled = isSubmitting || !isDirty;

  return (
    <>
      <Head>
        <title>Simulation | Budgetist</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Shell
        heading="Current balance"
        subtitle="As of 12/11/2022"
        // CTA={
        //   balance ? (
        //     <div className="text-3xl text-black">{Math.round(balance)}</div>
        //   ) : null
        // }
      >
        {/* salary form */}
        {isLoading || !user ? (
          <SkeletonLoader />
        ) : (
          <Form<SalaryFormValues>
            form={salaryForm}
            handleSubmit={onSalarySubmit}
            className="space-y-6"
          >
            <div>
              <TextField
                label="Title"
                placeholder="Salary"
                defaultValue={user.salary?.title}
                {...register("title")}
              />
            </div>
            <div className="flex space-x-3">
              <div className="flex-[1_1_80%]">
                <NumberInput<SalaryFormValues>
                  control={control}
                  name="amount"
                  label="Salary"
                  placeholder="Current salary..."
                />
              </div>
              <div>
                <CurrencyInput control={control as unknown as Control} />
              </div>
            </div>

            <div>
              <Variance
                isDisabled={salaryMutation.isLoading}
                varianceHidden={varianceHidden}
                setVarianceHidden={setVarianceHidden}
              />
            </div>

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
        )}
        {/* run simulation */}
        {/* <div className="mt-6 flex justify-start"> */}
        {/*   <Input */}
        {/*     id="years" */}
        {/*     name="years" */}
        {/*     required */}
        {/*     type="number" */}
        {/*     ref={yearsEl} */}
        {/*     className="w-auto rounded-r-none" */}
        {/*   /> */}
        {/*   <Button */}
        {/*     onClick={() => { */}
        {/*       setBalance(getTotalBalance(Number(yearsEl?.current?.value))); */}
        {/*     }} */}
        {/*     className="rounded-l-none py-2 px-4" */}
        {/*   > */}
        {/*     Run */}
        {/*   </Button> */}
        {/* </div> */}
      </Shell>
    </>
  );
}
