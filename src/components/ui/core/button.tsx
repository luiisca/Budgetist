import React, { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/utils/cn"
import { Tooltip } from "./Tooltip";
import { SVGComponent } from "~/types/SVGComponent";

export const buttonVariants = cva(
    "whitespace-nowrap inline-flex items-center text-sm font-medium relative rounded-md transition",
    {
        variants: {
            color: {
                primary:
                    "border border-transparent text-white bg-brand-500 hover:bg-brand-400 dark:focus-visible:ring-offset-dark-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-brand-500 dark:bg-dark-accent-100 dark:hover:bg-dark-accent-300 dark:focus-visible:ring-dark-accent-200 dark:shadow-darkTransparent ",
                secondary:
                    "border border-gray-200 text-brand-900 bg-white hover:bg-gray-100 focus-visible:outline-none focus-visible:border-gray-400 dark:bg-dark-300 dark:focus-visible:border-dark-400 dark:text-dark-800 dark:hover:bg-dark-tertiary dark:border-dark-400 dark:hover:border-dark-500 dark:shadow-darkTransparent dark:focus-visible:shadow-darkAccent",
                minimal:
                    "text-gray-700 bg-transparent hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:bg-gray-100 dark:text-dark-800 dark:hover:text-dark-neutral dark:hover:bg-[#686b8640] dark:focus-visible:bg-[#686b8640] dark:focus-visible:text-dark-neutral",
                destructive:
                    "text-red-700 focus-visible:text-red-700 bg-transparent hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:bg-red-100 focus-visible:ring-red-700 dark:focus-visible:shadow-darkDestructive dark:bg-dark-destructive-100 dark:border-dark-destructive-100 dark:hover:bg-dark-destructive-200 dark:focus-visible:ring-0 dark:focus-visible:ring-offset-transparent dark:focus-visible:border dark:text-white",
            },
            size: {
                base: "h-9 px-4 py-2.5",
                lg: "h-[36px] px-4 py-2.5 ",
                icon: "flex justify-center min-h-[36px] min-w-[36px] "
            },
            loading: {
                true: "cursor-wait"
            },
            disabled: {
                true: "cursor-not-allowed"
            }
        },
        compoundVariants: [
            {
                disabled: true,
                color: 'primary',
                className: "opacity-40 hover:bg-brand-500 dark:hover:bg-dark-accent-100",
            },
            {
                disabled: true,
                color: 'secondary',
                className: "opacity-40 hover:bg-transparent dark:hover:bg-dark-300 dark:hover:border-dark-400",
            },
            {
                disabled: true,
                color: 'minimal',
                className: "opacity-40 hover:bg-transparent dark:hover:bg-transparent dark:hover:text-dark-800",
            },
            {
                disabled: true,
                color: 'destructive',
                className: "opacity-40 hover:bg-transparent dark:hover:bg-dark-destructive-100",
            }
        ],
        defaultVariants: {
            color: "primary",
            size: "base",
            loading: false,
            disabled: false,
        },
    }
)

type InferredVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonColor = NonNullable<InferredVariantProps["color"]>;
export type ButtonBaseProps = {
    /** Action that happens when the button is clicked */
    onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
    /* Primary: Signals most important actions at any given point in the application.
         Secondary: Gives visual weight to actions that are important
         Minimal: Used for actions that we want to give very little significane to */
    /**Left aligned icon*/
    StartIcon?: SVGComponent | React.ElementType;
    /**Right aligned icon */
    EndIcon?: SVGComponent;
    /**Tool tip used when icon size is set to small */
    tooltip?: string;
    asChild?: boolean;
    loading?: boolean;
} & Omit<InferredVariantProps, "color"> & {
    color?: ButtonColor
};

export type ButtonProps = ButtonBaseProps &
    (
        | (Omit<JSX.IntrinsicElements["button"], "onClick" | "ref"> & { href?: never })
    );

export const Button = forwardRef<
    HTMLButtonElement,
    ButtonProps
>(function Button(props: ButtonProps, forwardedRef) {
    const {
        asChild,
        loading = false,
        color = "primary",
        size = "base",
        StartIcon,
        EndIcon,
        className,
        // attributes propagated from `HTMLAnchorProps` or `HTMLButtonProps`
        ...passThroughProps
    } = props;
    // Buttons are **always** disabled if we're in a `loading` state
    const disabled = props.disabled || loading;

    if (asChild) {
        return (
            <Slot
                disabled={disabled}
                ref={forwardedRef}
                className={cn(buttonVariants({ color, size, loading, disabled }), className)}
                // if we click a disabled button, we prevent going through the click handler
                onClick={disabled
                    ? (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                        e.preventDefault();
                    }
                    : props.onClick}
                {...passThroughProps} />
        )
    }

    return (
        <button
            disabled={disabled}
            ref={forwardedRef}
            className={cn(buttonVariants({ color, size, loading, disabled }), className)}
            // if we click a disabled button, we prevent going through the click handler
            onClick={disabled
                ? (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
                    e.preventDefault();
                }
                : props.onClick}
            {...passThroughProps}
        >
            {StartIcon && (
                <StartIcon
                    className={cn(
                        "inline-flex",
                        size === "icon" ? "h-4 w-4 " : "mr-2 h-4 w-4"
                    )}
                />
            )}
            {props.children}
            {loading && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                    <svg
                        className={cn(
                            "mx-4 h-4 w-4 animate-spin",
                            color === "primary" ? "text-white" : "text-black dark:text-white"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                </div>
            )}
            {EndIcon && (
                <EndIcon className="-mr-1 inline h-5 w-5 ltr:ml-2 rtl:mr-2" />
            )}
        </button>
    )
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
