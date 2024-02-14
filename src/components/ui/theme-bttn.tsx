"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

export function ModeToggle() {
    const { resolvedTheme, setTheme } = useTheme()

    return (
        <Button
            aria-label="Toggle Dark Mode"
            className={classNames(
                className || "",
                "flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 ring-gray-300 transition-all [&:not(:focus-visible)]:hover:ring-1",
                "dark:bg-dark-secondary dark:ring-dark-400 dark:focus-visible:ring-dark-accent-200 [&:not(:focus-visible)]:dark:hover:ring-dark-500"
            )}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
            {mounted && (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="h-5 w-5 text-gray-800 dark:text-gray-200"
                >
                    {resolvedTheme === "dark" ? (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                    ) : (
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    )}
                </svg>
            )}
        </Button>
    )
}

{/* <Button variant="outline" size="icon"> */ }
{/*     <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" /> */ }
{/*     <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /> */ }
{/*     <span className="sr-only">Toggle theme</span> */ }
{/* </Button> */ }
