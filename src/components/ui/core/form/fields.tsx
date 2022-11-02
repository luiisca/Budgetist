import { useId } from "@radix-ui/react-id";
import React, { forwardRef, ReactElement, ReactNode, Ref, useCallback, useState } from "react";
import { Check, Circle, Info, X, Eye, EyeOff } from "react-feather";
import {
  FieldErrors,
  FieldValues,
  // FormProvider,
  // SubmitHandler,
  useFormContext,
  // UseFormReturn,
} from "react-hook-form";

import classNames from "classnames";
import { Skeleton, Tooltip } from "components/ui";

type InputProps = JSX.IntrinsicElements["input"];

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  return (
    <input
      {...props}
      ref={ref}
      className={classNames(
        "mb-2 block h-9 w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1",
        props.className
      )}
    />
  );
});

export function Label(props: JSX.IntrinsicElements["label"]) {
  return (
    <label
      {...props}
      className={classNames("mb-2 block text-sm font-medium leading-none text-gray-700", props.className)}>
      {props.children}
    </label>
  );
}

const customErrorMessages: Record<string, string> = {
    //
}

function HintsOrErrors<T extends FieldValues = FieldValues>(props: {
  hintErrors?: string[];
  fieldName: string;
}) {
  const methods = useFormContext() as ReturnType<typeof useFormContext> | null;
  /* If there's no methods it means we're using these components outside a React Hook Form context */
  if (!methods) return null;
  const { formState } = methods;
  const { hintErrors, fieldName } = props;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const fieldErrors: FieldErrors<T> | undefined = formState.errors[fieldName];

  if (!hintErrors && fieldErrors && !fieldErrors.message) {
    // no hints passed, field errors exist and they are custom ones
    return (
      <div className="text-gray mt-2 flex items-center text-sm text-gray-700">
        <ul className="ml-2">
          {Object.keys(fieldErrors).map((key: string) => {
            return (
              <li key={key} className="text-blue-700">
                {customErrorMessages[`${fieldName}_hint_${key}`]}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (hintErrors && fieldErrors) {
    // hints passed, field errors exist
    return (
      <div className="text-gray mt-2 flex items-center text-sm text-gray-700">
        <ul className="ml-2">
          {hintErrors.map((key: string) => {
            const submitted = formState.isSubmitted;
            const error = fieldErrors[key] || fieldErrors.message;
            return (
              <li
                key={key}
                className={error !== undefined ? (submitted ? "text-red-700" : "") : "text-green-600"}>
                {error !== undefined ? (
                  submitted ? (
                    <X size="12" strokeWidth="3" className="mr-2 -ml-1 inline-block" />
                  ) : (
                    <Circle fill="currentColor" size="5" className="mr-2 inline-block" />
                  )
                ) : (
                  <Check size="12" strokeWidth="3" className="mr-2 -ml-1 inline-block" />
                )}
                {customErrorMessages[`${fieldName}_hint_${key}`]}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // errors exist, not custom ones, just show them as is
  if (fieldErrors) {
    return (
      <div className="text-gray mt-2 flex items-center text-sm text-red-700">
        <Info className="mr-1 h-3 w-3" />
        <>{fieldErrors.message}</>
      </div>
    );
  }

  if (!hintErrors) return null;

  // hints passed, no errors exist, proceed to just show hints
  return (
    <div className="text-gray mt-2 flex items-center text-sm text-gray-700">
      <ul className="ml-2">
        {hintErrors.map((key: string) => {
          // if field was changed, as no error exist, show checked status and color
          const dirty = formState.dirtyFields[fieldName];
          return (
            <li key={key} className={!!dirty ? "text-green-600" : ""}>
              {!!dirty ? (
                <Check size="12" strokeWidth="3" className="mr-2 -ml-1 inline-block" />
              ) : (
                <Circle fill="currentColor" size="5" className="mr-2 inline-block" />
              )}
              {customErrorMessages[`${fieldName}_hint_${key}`]}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type InputFieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  hintErrors?: string[];
  addOnLeading?: ReactNode;
  addOnSuffix?: ReactNode;
  addOnFilled?: boolean;
  error?: string;
  labelSrOnly?: boolean;
  containerClassName?: string;
  t?: (key: string) => string;
} & React.ComponentProps<typeof Input> & {
    labelProps?: React.ComponentProps<typeof Label>;
    labelClassName?: string;
  };

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(props, ref) {
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
    hint,
    hintErrors,
    labelSrOnly,
    containerClassName,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ...passThrough
  } = props;

  return (
    <div className={classNames(containerClassName)}>
      {!!name && (
        <Skeleton
          as={Label}
          htmlFor={id}
          loadingClassName="w-16"
          {...labelProps}
          className={classNames(labelClassName, labelSrOnly && "sr-only", props.error && "text-red-900")}>
          {label}
        </Skeleton>
      )}
      {addOnLeading || addOnSuffix ? (
        <div
          className={classNames(
            " mb-1 flex items-center rounded-md focus-within:outline-none focus-within:ring-2 focus-within:ring-neutral-800 focus-within:ring-offset-1",
            addOnSuffix && "group flex-row-reverse"
          )}>
          <div
            className={classNames(
              "h-9 border border-gray-300",
              addOnFilled && "bg-gray-100",
              addOnLeading && "rounded-l-md border-r-0 px-3",
              addOnSuffix && "rounded-r-md border-l-0 px-3"
            )}>
            <div
              className={classNames(
                "flex h-full flex-col justify-center px-1 text-sm",
                props.error && "text-red-900"
              )}>
              <span className="whitespace-nowrap py-2.5">{addOnLeading || addOnSuffix}</span>
            </div>
          </div>
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
        </div>
      ) : (
        <Input id={id} placeholder={placeholder} className={className} {...passThrough} ref={ref} />
      )}
      <HintsOrErrors hintErrors={hintErrors} fieldName={name}/>
      {hint && <div className="text-gray mt-2 flex items-center text-sm text-gray-700">{hint}</div>}
    </div>
  );
});

export const EmailField = forwardRef<HTMLInputElement, InputFieldProps>(function EmailField(props, ref) {
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
});
