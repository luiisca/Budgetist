import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import classNames from "classnames";
import { ComponentProps, forwardRef } from "react";

export const Dropdown = DropdownMenuPrimitive.Root;

type DropdownMenuTriggerProps = ComponentProps<
  (typeof DropdownMenuPrimitive)["Trigger"]
>;
export const DropdownMenuTrigger = forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ className = "", ...props }, forwardedRef) => (
  <DropdownMenuPrimitive.Trigger
    {...props}
    className={classNames(
      className,
      props.asChild
        ? className // are these applied to its child? since trigger component dissapears or merges with its child
        : ``
    )}
    ref={forwardedRef}
  />
));
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuTriggerItem = DropdownMenuPrimitive.Trigger;

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

type DropdownMenuContentProps = ComponentProps<
  (typeof DropdownMenuPrimitive)["Content"]
>;
export const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ children, ...props }, forwardedRef) => (
  <DropdownMenuPrimitive.Content
    {...props}
    className={classNames(
      "slideInTop w-50 relative z-10 mt-1 -ml-0 origin-top-right rounded-lg py-1 text-sm shadow-lg",
      "bg-white ring-1 ring-black ring-opacity-5 focus-visible:ring-1 focus-visible:ring-opacity-5 focus-visible:ring-offset-0",
      "backdrop-blur-sm ",
      "dark:bg-[#1d1e2b7f] dark:shadow-100 dark:ring-dark-400",
      // custom scrollbar
      "scrollbar-track-w-[80px] rounded-md scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 scrollbar-thumb-rounded-md ",
      "dark:scrollbar-thumb-dark-accent-100 dark:hover:scrollbar-thumb-dark-accent-300",
      props.className
    )}
    ref={forwardedRef}
  >
    {children}
  </DropdownMenuPrimitive.Content>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export type DropdownMenuItemProps = ComponentProps<
  (typeof DropdownMenuPrimitive)["CheckboxItem"]
>;
export const DropdownMenuItem = forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(({ className = "", ...props }, forwardedRef) => (
  <DropdownMenuPrimitive.Item
    className={classNames(
      "mx-1 rounded-md text-sm text-gray-700",
      "focus:borde-0 outline-none focus:bg-gray-100 focus:text-gray-900 focus:ring-transparent focus:ring-offset-transparent",
      "dark:text-dark-800 dark:focus:bg-dark-400 ",
      className
    )}
    {...props}
    ref={forwardedRef}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

type DropdownMenuSeparatorProps = ComponentProps<
  (typeof DropdownMenuPrimitive)["Separator"]
>;
export const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className = "", ...props }, forwardedRef) => (
  <DropdownMenuPrimitive.Separator
    className={classNames("my-1 h-px bg-gray-200 dark:bg-dark-400", className)}
    {...props}
    ref={forwardedRef}
  />
));
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export default Dropdown;
