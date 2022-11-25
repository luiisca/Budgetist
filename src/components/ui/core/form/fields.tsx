import { useId } from "@radix-ui/react-id";
import React, { forwardRef, ReactElement, ReactNode, Ref } from "react";
import {
  Controller,
  ControllerProps,
  FieldErrors,
  FieldValues,
  FormProvider,
  SubmitHandler,
  useFormContext,
  UseFormReturn,
} from "react-hook-form";

import classNames from "classnames";
import { getErrorFromUnknown } from "utils/errors";
import showToast from "components/ui/core/notifications";
import { FiInfo } from "react-icons/fi";
import { ProfileDataInputType } from "prisma/*";

type InputProps = JSX.IntrinsicElements["input"];

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  props,
  ref
) {
  return (
    <input
      {...props}
      ref={ref}
      className={classNames(
        "mb-2 block h-9 w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1 hover:border-gray-400",
        props.className
      )}
    />
  );
});

export function Label(props: JSX.IntrinsicElements["label"]) {
  return (
    <label
      {...props}
      className={classNames(
        "mb-2 block text-sm font-medium leading-none text-gray-700",
        props.className
      )}
    >
      {props.children}
    </label>
  );
}

function Errors<T extends FieldValues = FieldValues>(props: {
  fieldName: string;
}) {
  const methods = useFormContext() as ReturnType<typeof useFormContext> | null;
  /* If there's no methods it means we're using these components outside a React Hook Form context */
  if (!methods) return null;
  const { formState } = methods;
  const { fieldName } = props;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const fieldErrors: FieldErrors<T> | undefined = formState.errors[fieldName];

  if (!fieldErrors) return null;

  return (
    <div className="text-gray mt-2 flex items-center text-sm text-red-700">
      <FiInfo className="mr-1 h-3 w-3" />
      <>{fieldErrors.message}</>
    </div>
  );
}

type InputFieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  addOnLeading?: ReactNode;
  addOnSuffix?: ReactNode;
  addOnFilled?: boolean;
  error?: string;
  loader?: ReactNode;
  labelSrOnly?: boolean;
  containerClassName?: string;
} & React.ComponentProps<typeof Input> & {
    labelProps?: React.ComponentProps<typeof Label>;
    labelClassName?: string;
  };

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(props, ref) {
    const id = useId();
    const name = props.name || "";
    const {
      label = name,
      labelProps,
      labelClassName,
      placeholder = "",
      className,
      addOnLeading,
      addOnSuffix,
      addOnFilled = true,
      loader,
      hint,
      labelSrOnly,
      containerClassName,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ...passThrough
    } = props;

    return (
      <div className={classNames(containerClassName)}>
        {!!name && (
          <Label
            htmlFor={id}
            {...labelProps}
            className={classNames(
              labelClassName,
              labelSrOnly && "sr-only",
              props.error && "text-red-900"
            )}
          >
            {label}
          </Label>
        )}
        {addOnLeading || addOnSuffix ? (
          <div
            className={classNames(
              " mb-1 flex items-center rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-neutral-800 focus-within:ring-offset-1",
              addOnSuffix && "group flex-row-reverse"
            )}
          >
            <div
              className={classNames(
                "h-9 border border-gray-300",
                addOnFilled && "bg-gray-100",
                addOnLeading && "rounded-l-md border-r-0 px-3",
                addOnSuffix && "rounded-r-md border-l-0 px-3"
              )}
            >
              <div
                className={classNames(
                  "flex h-full flex-col justify-center px-1 text-sm",
                  props.error && "text-red-900"
                )}
              >
                <span className="whitespace-nowrap py-2.5">
                  {addOnLeading || addOnSuffix}
                </span>
              </div>
            </div>
            <div className="relative w-full">
              <Input
                id={id}
                placeholder={placeholder}
                className={classNames(
                  className,
                  addOnLeading && "rounded-l-none",
                  addOnSuffix && "rounded-r-none",
                  "!my-0 !ring-0"
                )}
                {...passThrough}
                ref={ref}
              />
              {loader}
            </div>
          </div>
        ) : (
          <div className="relative w-full">
            <Input
              id={id}
              placeholder={placeholder}
              className={className}
              {...passThrough}
              ref={ref}
            />

            {loader}
          </div>
        )}
        <Errors fieldName={name} />
        {hint && (
          <div className="text-gray mt-2 flex items-center text-sm text-gray-700">
            {hint}
          </div>
        )}
      </div>
    );
  }
);

export const TextField = forwardRef<HTMLInputElement, InputFieldProps>(
  function TextField(props, ref) {
    return <InputField ref={ref} {...props} />;
  }
);

export const EmailField = forwardRef<HTMLInputElement, InputFieldProps>(
  function EmailField(props, ref) {
    return (
      <InputField
        ref={ref}
        type="email"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect="off"
        inputMode="email"
        {...props}
      />
    );
  }
);

const transIntoInt = (value: string) => {
  return Number.isNaN(parseInt(value as string, 10))
    ? 0
    : parseInt(value as string, 10);
};

export const NumberInput = <T extends FieldValues = ProfileDataInputType>(
  arg: Omit<ControllerProps<T>, "render"> & {
    label: string;
    placeholder?: string;
    addOnSuffix?: ReactNode;
    className?: string;
    loader?: ReactNode;
    onChange?: (...event: any[]) => void;
    controllerValue?: string | number | readonly string[];
  }
) => {
  return (
    <Controller
      {...arg}
      render={({ field }) => (
        <TextField
          {...field}
          className={classNames(arg.className)}
          label={arg.label}
          addOnSuffix={arg.addOnSuffix}
          placeholder={arg.placeholder}
          loader={arg.loader}
          onChange={(e) => {
            return field.onChange(
              (arg?.onChange && arg?.onChange(e)) ||
                transIntoInt(e.target.value)
            );
          }}
          value={arg.controllerValue || transIntoInt(field.value)}
        />
      )}
    />
  );
};

type FormProps<T extends object> = {
  form: UseFormReturn<T>;
  handleSubmit: SubmitHandler<T>;
} & Omit<JSX.IntrinsicElements["form"], "onSubmit">;

const PlainForm = <T extends FieldValues>(
  props: FormProps<T>,
  ref: Ref<HTMLFormElement>
) => {
  const { form, handleSubmit, ...passThrough } = props;

  return (
    <FormProvider {...form}>
      <form
        ref={ref}
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          form
            .handleSubmit(handleSubmit)(event)
            .catch((err) => {
              showToast(`${getErrorFromUnknown(err).message}`, "error");
            });
        }}
        {...passThrough}
      >
        {
          /* @see https://react-hook-form.com/advanced-usage/#SmartFormComponent */
          // to provide register prop to every valid child field (wow)
          React.Children.map(props.children, (child) => {
            return typeof child !== "string" &&
              typeof child !== "number" &&
              typeof child !== "boolean" &&
              child &&
              "props" in child &&
              child.props.name
              ? React.createElement(child.type, {
                  ...{
                    ...child.props,
                    register: form.register,
                    key: child.props.name,
                  },
                })
              : child;
          })
        }
      </form>
    </FormProvider>
  );
};

export const Form = forwardRef(PlainForm) as <T extends FieldValues>(
  p: FormProps<T> & { ref?: Ref<HTMLFormElement> }
) => ReactElement;
