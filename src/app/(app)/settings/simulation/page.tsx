import { Metadata } from "next";

import SimForm from "./sim-form";
import { Alert } from "~/components/ui/alert";
import { api } from "~/lib/trpc/server";

// @TODO: improve wording
export const metadata: Metadata = {
    title: "Simulation",
    description: "Manage settings for your Budgetist simulation",
}

export default async function Simulation() {
    const user = await api.user.get.query();

    if (!user) {
        return (
            <Alert
                severity="error"
                title="Something went wrong"
                message='Could not get user data. Please reload the page'
            />
        )
    };

    return (
        <>
            <header className="mx-auto block justify-between pt-12 sm:flex sm:pt-8">
                <div className="mb-8 flex flex-col w-full border-b border-gray-200 pb-8 dark:border-dark-350">
                    <h1 className="mb-1 font-cal text-xl font-bold tracking-wide text-black dark:text-dark-neutral">
                        Simulation
                    </h1>
                    <p className="text-sm text-gray-600 ltr:mr-4 rtl:ml-4 dark:text-dark-600">
                        {/* @TODO: improv wording */}
                        Manage configs for your Budgetist simulation
                    </p>
                </div>
            </header>
            <SimForm user={user} />
        </>
    )
}
