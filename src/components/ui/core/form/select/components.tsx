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
        "focus:ring-0 focus:ring-offset-0 dark:!text-darkgray-900 !text-black",
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
        "!flex !cursor-pointer justify-between !py-3 dark:bg-darkgray-100",
        props.isFocused && "!bg-gray-100 dark:!bg-darkgray-200",
        props.isSelected && "!bg-neutral-900 dark:!bg-darkgray-300"
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
      "!rounded-md border-gray-300 bg-white text-sm leading-4 placeholder:text-sm placeholder:font-normal focus-within:border-0 focus-within:ring-2 focus-within:ring-neutral-800 hover:border-neutral-400 dark:border-darkgray-300 dark:bg-darkgray-100 dark:focus-within:ring-white"
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
      "border-1 !rounded-md border-gray-900 bg-white text-sm leading-4 dark:border-darkgray-300 dark:bg-darkgray-100 dark:text-white",
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
      "scrollbar-track-w-[80px] rounded-md scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md dark:scrollbar-thumb-darkgray-300",
      className
    )}
  />
);