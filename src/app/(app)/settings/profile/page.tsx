import { Fragment } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile",
    description: "Manage settings for your Budgetist profile",
}

export default function Profile() {
    return (
        <Fragment>
            <header className="mx-auto pt-8 lg:pt-0">
                <div className="mb-8 flex flex-col w-full border-b border-gray-200 pb-8 dark:border-dark-350">
                    <h1 className="mb-1 font-cal text-xl font-bold tracking-wide text-black dark:text-dark-neutral">
                        Profile
                    </h1>
                    <p className="text-sm text-gray-600 ltr:mr-4 rtl:ml-4 dark:text-dark-600">
                        Manage settings for your Budgetist profile
                    </p>
                </div>
            </header>
            {/* <Fragment>{children}</Fragment> */}
        </Fragment>
    )
}
