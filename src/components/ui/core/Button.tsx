import Link, { LinkProps } from "next/link";
import React, { forwardRef } from "react";
import { Icon } from "react-feather";

import classNames from "classnames";

import { Tooltip } from "./Tooltip";

export type ButtonBaseProps = {
  /* Primary: Signals most important actions at any given point in the application.
       Secondary: Gives visual weight to actions that are important
       Minimal: Used for actions that we want to give very little significane to */
  color?: keyof typeof variantClassName;
  /**Default: H = 36px (default)
       Large: H = 38px (Onboarding, modals)
       Icon: Makes the button be an icon button */
  size?: "base" | "lg" | "icon";
  /**Signals the button is loading */
  loading?: boolean;
  /** Disables the button from being clicked */
  disabled?: boolean;
  /** Action that happens when the button is clicked */
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  /**Left aligned icon*/
  StartIcon?: Icon | React.ElementType;
  /**Right aligned icon */
  EndIcon?: Icon;
  shallow?: boolean;
  /**Tool tip used when icon size is set to small */
  tooltip?: string;
  /** @deprecated This has now been replaced by button group. */
  combined?: boolean;
  flex?: boolean;
};
export type ButtonProps = ButtonBaseProps &
  (
    | (Omit<JSX.IntrinsicElements["a"], "href" | "onClick" | "ref"> & LinkProps)
    | (Omit<JSX.IntrinsicElements["button"], "onClick" | "ref"> & {
        href?: never;
      })
  );

const variantClassName = {
  primary:
    "border border-transparent text-white bg-brand-500 hover:bg-brand-400 dark:focus-visible:ring-offset-dark-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-brand-500 dark:bg-dark-accent-100 dark:hover:bg-dark-accent-300 dark:focus-visible:ring-dark-accent-200 dark:shadow-darkTransparent",
  secondary:
    "border border-gray-200 text-brand-900 bg-white hover:bg-gray-100 focus-visible:outline-none focus-visible:border-gray-400 dark:bg-dark-300 dark:focus-visible:border-dark-400 dark:text-dark-800 dark:hover:bg-dark-tertiary dark:border-dark-400 dark:hover:border-dark-500 dark:shadow-darkTransparent dark:focus-visible:shadow-darkAccent",
  minimal:
    "text-gray-700 bg-transparent hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:bg-gray-100 dark:text-dark-800 dark:hover:text-dark-neutral dark:hover:bg-[#686b8640] dark:focus-visible:bg-[#686b8640] dark:focus-visible:text-dark-neutral",
  minimalSecondary:
    "text-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-darkgray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:bg-gray-100 focus-visible:ring-brand-900 dark:text-darkgray-900 hover:dark:text-gray-50 border border-transparent hover:border-gray-300 dark:hover:border-darkgray-300",
  destructive:
    "text-gray-900 focus-visible:text-red-700 bg-transparent hover:bg-red-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:bg-red-100 focus-visible:ring-red-700 dark:focus-visible:shadow-darkDestructive dark:bg-dark-destructive-100 dark:border-dark-destructive-100 dark:hover:bg-dark-destructive-200 dark:focus-visible:ring-0 dark:focus-visible:ring-offset-transparent dark:focus-visible:border dark:text-white",
};
const variantDisabledClassName = {
  primary:
    "border border-transparent bg-brand-500 bg-opacity-20 text-white dark:bg-dark-accent-400",
  secondary: "border border-gray-200 text-brand-900 bg-white opacity-30",
  minimal: "text-gray-400 bg-transparent",
  minimalSecondary: "text-gray-400 bg-transparent",
  destructive: "text-red-700 bg-transparent opacity-30",
};

export const Button = forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  ButtonProps
>(function Button(props: ButtonProps, forwardedRef) {
  const {
    loading = false,
    color = "primary",
    size = "base",
    type = "button",
    StartIcon,
    EndIcon,
    shallow,
    // attributes propagated from `HTMLAnchorProps` or `HTMLButtonProps`
    ...passThroughProps
  } = props;
  // Buttons are **always** disabled if we're in a `loading` state
  const disabled = props.disabled || loading;
  // If pass an `href`-attr is passed it's `<a>`, otherwise it's a `<button />`
  const isLink = typeof props.href !== "undefined";
  const elementType = isLink ? "a" : "button";
  const element = React.createElement(
    elementType,
    {
      ...passThroughProps,
      disabled,
      type: !isLink ? type : undefined,
      ref: forwardedRef,
      className: classNames(
        // base styles independent what type of button it is
        "inline-flex items-center text-sm font-medium relative",
        // different styles depending on size
        size === "base" && "h-9 px-4 py-2.5  ",
        size === "lg" && "h-[36px] px-4 py-2.5 ",
        size === "icon" && "flex justify-center min-h-[36px] min-w-[36px] ",
        "rounded-md",
        // different styles depending on color
        // set not-allowed cursor if disabled
        disabled ? variantDisabledClassName[color] : variantClassName[color],
        loading ? "cursor-wait" : disabled ? "cursor-not-allowed" : "",
        props.className
      ),
      // if we click a disabled button, we prevent going through the click handler
      onClick: disabled
        ? (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
            e.preventDefault();
          }
        : props.onClick,
    },
    <>
      {StartIcon && (
        <StartIcon
          className={classNames(
            "inline-flex",
            size === "icon" ? "h-4 w-4 " : "mr-2 h-4 w-4 stroke-[1.5px]"
          )}
        />
      )}
      {props.children}
      {loading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
          <svg
            className={classNames(
              "mx-4 h-5 w-5 animate-spin",
              color === "primary" ? "text-white dark:text-black" : "text-black"
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
      {EndIcon && (
        <EndIcon className="-mr-1 inline h-5 w-5 ltr:ml-2 rtl:mr-2" />
      )}
    </>
  );

  return props.href ? (
    <Link
      passHref
      href={props.href}
      shallow={shallow && shallow}
      legacyBehavior
    >
      {element}
    </Link>
  ) : (
    <Wrapper tooltip={props.tooltip}>{element}</Wrapper>
  );
});

const Wrapper = ({
  children,
  tooltip,
}: {
  tooltip?: string;
  children: React.ReactNode;
}) => {
  if (!tooltip) {
    return <>{children}</>;
  }

  return <Tooltip content={tooltip}>{children}</Tooltip>;
};

export default Button;
