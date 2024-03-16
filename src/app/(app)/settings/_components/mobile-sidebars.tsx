'use client'

import Link from "next/link";
import { useState } from "react";
import { Button } from "~/components/ui";
import { cn } from "~/lib/cn";
import { ArrowLeft } from "lucide-react";

export default function MobileSidebars({ children }: { children: React.ReactNode }) {
    const [sideContainerOpen, setSideContainerOpen] = useState(false);

    return (
        <>
            {/* show top navigation for md and smaller (tablet and phones) */}
            <nav className="relative z-40 flex w-full items-center justify-between border-b border-emphasis bg-muted px-4 py-1.5 sm:p-4 lg:hidden">
                <div className="flex items-center space-x-3 ">
                    <Button
                        color="minimal"
                        size="icon"
                        onClick={() => setSideContainerOpen(!sideContainerOpen)}
                        className="group"
                    >
                        <svg
                            width="14"
                            height="10"
                            viewBox="0 0 14 10"
                            className="transition-colors dark:fill-dark-neutral"
                        >
                            <rect width="14" height="2"></rect>
                            <rect y="4" width="14" height="2"></rect>
                            <rect y="8" width="14" height="2"></rect>
                        </svg>
                    </Button>
                    <Link
                        href="/simulation"
                        className="flex items-center space-x-2 rounded-md px-3 py-1 text-foreground-emphasis hover:bg-subtle"
                    >
                        <ArrowLeft className='h-4 w-4' />
                        <p className="font-semibold">
                            Settings
                        </p>
                    </Link>
                </div>
            </nav>

            {/* overlay */}
            <div
                className={
                    cn(
                        "absolute z-40 m-0 h-screen w-screen bg-black/50",
                        !sideContainerOpen && "hidden"
                    )
                }
                onClick={() => {
                    setSideContainerOpen(false);
                }}
            />
            {/* mobile and tablet sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 z-50 m-0 w-56 transform overflow-hidden transition duration-200 ease-in-out lg:hidden",
                    sideContainerOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {children}
            </div>
        </>
    )
}
