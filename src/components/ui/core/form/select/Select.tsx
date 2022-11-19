import { useId } from "@radix-ui/react-id";
import classNames from "classnames";
import { Label } from "components/ui";
import * as React from "react";
import ReactSelect, {
  components as reactSelectComponents,
  GroupBase,
  Props,
  SelectComponentsConfig,
} from "react-select";

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
  classNamePrefix: "cal-react-select",
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
  ...props
}: SelectProps<Option, IsMulti, Group>) => {
  const reactSelectProps = React.useMemo(() => {
    return getReactSelectProps<Option, IsMulti, Group>({
      className,
      components: components || {},
    });
  }, [className, components]);

  return (
    <ReactSelect
      {...reactSelectProps}
      {...props}
      styles={{
        option: (defaultStyles, state) => ({
          ...defaultStyles,
          backgroundColor: state.isSelected
            ? state.isFocused
              ? "var(--brand-color)"
              : "var(--brand-color)"
            : state.isFocused
            ? "var(--brand-color-dark-mode)"
            : "var(--brand-text-color)",
        }),
      }}
    />
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

export default Select;
