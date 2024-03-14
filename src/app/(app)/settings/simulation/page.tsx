import { Fragment } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Simulation",
    description: "Manage configs for your Budgetist simulation",
}

export default function Simulation() {
    return (
        <Fragment>
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
            {/* <Fragment>{children}</Fragment> */}
        </Fragment>
    )
}
