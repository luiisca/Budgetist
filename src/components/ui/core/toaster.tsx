"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"
import { cn } from "~/utils/cn"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps["theme"]}
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: cn(
                        "mb-2 flex !h-11 items-center space-x-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md right-0 w-2/3",
                    ),
                    success: cn(
                        "dark:bg-dark-accent-100 dark:text-dark-neutral",
                    ),
                    error:
                        "bg-red-100 !text-red-900 dark:bg-dark-destructive-100 dark:!text-white",
                    warning: cn(
                        "dark:bg-dark-accent-100 dark:text-dark-neutral",
                    )
                },
                duration: 3000,
            }}
            {...props}
        />
    )
}

export { Toaster }
