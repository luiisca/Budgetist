import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import classNames from "classnames";
import { ComponentProps, forwardRef } from "react";

export const Dropdown = DropdownMenuPrimitive.Root;

type DropdownMenuTriggerProps = ComponentProps<
  typeof DropdownMenuPrimitive["Trigger"]
>;
export const DropdownMenuTrigger = forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ className = "", ...props }, forwardedRef) => (
  <DropdownMenuPrimitive.Trigger
    {...props}
    className={
      props.asChild
        ? className // are these applied to its child? since trigger component dissapears or merges with its child
        : `inline-flex items-center rounded-sm bg-transparent px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-1 group-hover:text-black ${className}`
    }
    ref={forwardedRef}
  />
));
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export const DropdownMenuTriggerItem = DropdownMenuPrimitive.Trigger;

export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

type DropdownMenuContentProps = ComponentProps<
  typeof DropdownMenuPrimitive["Content"]
>;
export const DropdownMenuContent = forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ children, ...props }, forwardedRef) => (
  <DropdownMenuPrimitive.Content
    {...props}
    className={classNames(
      `slideInTop w-50 relative z-10 mt-1 -ml-0 origin-top-right rounded-sm bg-white text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`,
      props.className
    )}
    ref={forwardedRef}
  >
    {children}
  </DropdownMenuPrimitive.Content>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

type DropdownMenuItemProps = ComponentProps<
  typeof DropdownMenuPrimitive["CheckboxItem"]
>;
export const DropdownMenuItem = forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(({ className = "", ...props }, forwardedRef) => (
  <DropdownMenuPrimitive.Item
    className={`text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${className}`}
    {...props}
    ref={forwardedRef}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuSeparator = DropdownMenuPrimitive.Separator;

export default Dropdown;
