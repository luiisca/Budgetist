import { useId } from "@radix-ui/react-id";
import classNames from "classnames";
import * as React from "react";
import { useMemo } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import ReactSelect, {
  components as reactSelectComponents,
  GroupBase,
  Props,
  SingleValue,
  MultiValue,
  SelectComponentsConfig,
} from "react-select";
import { Errors, Label } from "../fields";

import {
  ControlComponent,
  InputComponent,
  MenuComponent,
  MenuListComponent,
  OptionComponent,
  SingleValueComponent,
  ValueContainerComponent,
  MultiValueComponent,
} from "./components";

export type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = Props<Option, IsMulti, Group>;

export const getReactSelectProps = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  components,
}: {
  className?: string;
  components: SelectComponentsConfig<Option, IsMulti, Group>;
}) => ({
  className: classNames(
    "block h-[36px] w-full min-w-0 flex-1 rounded-md",
    className
  ),
  classNamePrefix: "bud-react-select",
  components: {
    ...reactSelectComponents,
    IndicatorSeparator: () => null,
    Input: InputComponent,
    Option: OptionComponent,
    Control: ControlComponent,
    SingleValue: SingleValueComponent,
    Menu: MenuComponent,
    MenuList: MenuListComponent,
    ValueContainer: ValueContainerComponent,
    MultiValue: MultiValueComponent,
    ...components,
  },
});

const Select = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  components,
  name,
  ...props
}: SelectProps<Option, IsMulti, Group> & { name?: string }) => {
  const reactSelectProps = React.useMemo(() => {
    return getReactSelectProps<Option, IsMulti, Group>({
      className,
      components: components || {},
    });
  }, [className, components]);

  return (
    <>
      <ReactSelect
        {...reactSelectProps}
        {...props}
        styles={{
          control: () => ({
            // ...base,
          }),
          // option: (base) => ({
          //   border: "1px dotted red",
          //   background: "red",
          // }),
        }}
      />
      {name && <Errors fieldName={name} />}
    </>
  );
};

export const SelectField = function SelectField<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: {
    name?: string;
    containerClassName?: string;
    label?: string;
    labelProps?: React.ComponentProps<typeof Label>;
    className?: string;
    error?: string;
  } & SelectProps<Option, IsMulti, Group>
) {
  const {
    label = props.name || "",
    containerClassName,
    labelProps,
    className,
    ...passThrough
  } = props;
  const id = useId();
  return (
    <div className={classNames(containerClassName)}>
      <div className={classNames(className)}>
        {!!label && (
          <Label
            htmlFor={id}
            {...labelProps}
            className={classNames(props.error && "text-red-900")}
          >
            {label}
          </Label>
        )}
      </div>
      <Select {...passThrough} />
    </div>
  );
};

/**
 * TODO: It should replace Select after through testing
 */
export function SelectWithValidation<
  Option extends { label: string; value: string },
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  required = false,
  onChange,
  value,
  ...remainingProps
}: SelectProps<Option, IsMulti, Group> & { required?: boolean }) {
  const [hiddenInputValue, _setHiddenInputValue] = React.useState(() => {
    if (value instanceof Array || !value) {
      return;
    }
    return value.value || "";
  });

  const setHiddenInputValue = React.useCallback(
    (value: MultiValue<Option> | SingleValue<Option>) => {
      let hiddenInputValue = "";
      if (value instanceof Array) {
        hiddenInputValue = value.map((val) => val.value).join(",");
      } else {
        hiddenInputValue = value?.value || "";
      }
      _setHiddenInputValue(hiddenInputValue);
    },
    []
  );

  React.useEffect(() => {
    if (!value) {
      return;
    }
    setHiddenInputValue(value);
  }, [value, setHiddenInputValue]);

  return (
    <div className={classNames("relative", remainingProps.className)}>
      <Select
        value={value}
        {...remainingProps}
        onChange={(value, ...remainingArgs) => {
          setHiddenInputValue(value);
          if (onChange) {
            onChange(value, ...remainingArgs);
          }
        }}
      />
      {required && (
        <input
          tabIndex={-1}
          autoComplete="off"
          style={{
            opacity: 0,
            width: "100%",
            height: 1,
            position: "absolute",
          }}
          value={hiddenInputValue}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onChange={() => {}}
          // TODO:Not able to get focus to work
          // onFocus={() => selectRef.current?.focus()}
          required={required}
        />
      )}
    </div>
  );
}

export const ControlledSelect = <T extends FieldValues>({
  control,
  options,
  name,
  label,
  onChange,
}: {
  control: Control<T>;
  options: () => Array<any>;
  name: string;
  label?: string;
  onChange?: (...event: any[]) => string;
}) => {
  const selectOptions = useMemo(options, []);

  return (
    <Controller
      control={control}
      name={name as Path<T>}
      render={({ field }) => (
        <>
          {label && <Label className="text-gray-900">{label}</Label>}
          <Select
            name={name}
            value={field.value}
            options={selectOptions}
            onChange={(e) =>
              e && field.onChange((onChange && onChange({ ...e })) || { ...e })
            }
          />
        </>
      )}
    />
  );
};

export default Select;
