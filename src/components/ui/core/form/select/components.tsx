import classNames from "classnames";
import { FiCheck } from "react-icons/fi";
import {
  components as reactSelectComponents,
  ControlProps,
  GroupBase,
  InputProps,
  MenuListProps,
  MenuProps,
  MultiValueProps,
  OptionProps,
  SingleValueProps,
  ValueContainerProps,
} from "react-select";

export const InputComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  inputClassName,
  ...props
}: InputProps<Option, IsMulti, Group>) => {
  return (
    <reactSelectComponents.Input
      // disables our default form focus hightlight on the react-select input element
      inputClassName={classNames(
        "focus:ring-0 focus:ring-offset-0 text-black",
        inputClassName
      )}
      {...props}
    />
  );
};

export const OptionComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: OptionProps<Option, IsMulti, Group>) => {
  return (
    <reactSelectComponents.Option
      {...props}
      className={classNames(
        className,
        "!flex !cursor-pointer justify-between !py-3",
        props.isFocused &&
          !props.isSelected &&
          "!bg-gray-100 dark:!bg-transparent",
        props.isSelected
          ? "!bg-neutral-900 dark:!bg-dark-accent-100"
          : "dark:hover:!bg-dark-tertiary"
      )}
    >
      <span>{props.label}</span>{" "}
      {props.isSelected && <FiCheck className="h-4 w-4" />}
    </reactSelectComponents.Option>
  );
};

export const ControlComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: ControlProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.Control
    {...props}
    className={classNames(
      className,
      "flex justify-between",
      "rounded-md border border-gray-300 bg-white text-sm leading-4 transition-all placeholder:text-sm placeholder:font-normal hover:border-gray-400 [&_svg]:transition-colors",
      "dark:border-transparent dark:bg-dark-300 dark:shadow-100 dark:hover:shadow-200 [&_svg]:dark:hover:text-dark-neutral",
      props.isFocused &&
        "border-gray-400 ring-2 ring-gray-600 ring-offset-2 dark:border-dark-accent-200 dark:shadow-darkAccent dark:ring-1 dark:ring-offset-0 [&_svg]:dark:text-dark-800"
    )}
  />
);

export const SingleValueComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: SingleValueProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.SingleValue
    {...props}
    className={classNames(
      className,
      "text-black placeholder:text-gray-400 dark:text-darkgray-900 dark:placeholder:text-darkgray-500"
    )}
  />
);

export const ValueContainerComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: ValueContainerProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.ValueContainer
    {...props}
    className={classNames(
      "text-black placeholder:text-gray-400 dark:text-darkgray-900 dark:placeholder:text-darkgray-500",
      className
    )}
  />
);

export const MultiValueComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: MultiValueProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.MultiValue
    {...props}
    className={classNames(
      "!rounded-md bg-gray-100 text-gray-700 dark:bg-darkgray-200 dark:text-darkgray-900",
      className
    )}
  />
);

export const MenuComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: MenuProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.Menu
    {...props}
    className={classNames(
      "!rounded-md bg-white text-sm leading-4 ",
      "dark:border-dark-400 dark:bg-dark-300 dark:shadow-darkTransparent",
      className
    )}
  />
);

export const MenuListComponent = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>({
  className,
  ...props
}: MenuListProps<Option, IsMulti, Group>) => (
  <reactSelectComponents.MenuList
    {...props}
    className={classNames(
      "scrollbar-track-w-[80px] rounded-md scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md ",
      "dark:scrollbar-thumb-dark-accent-100 dark:hover:scrollbar-thumb-dark-accent-300",
      className
    )}
  />
);
