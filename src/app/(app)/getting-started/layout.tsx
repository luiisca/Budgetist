import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Budgetist - Getting Started",
}

export default function GettingStartedLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <div
            className="min-h-screen text-black dark:bg-dark-primary dark:text-dark-neutral"
        >
            <div className="mx-auto px-4 py-6 md:py-24 relative sm:max-w-[600px]">
                {children}
            </div>
        </div>
    )
}
