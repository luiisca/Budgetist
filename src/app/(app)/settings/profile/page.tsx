import { Metadata } from "next";

import { Alert } from "~/components/ui/alert";
import { api } from "~/lib/trpc/server";
import ProfileForm from "./profile-form";

export const metadata: Metadata = {
    title: "Profile",
    description: "Manage settings for your Budgetist profile",
}

export default async function Profile() {
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
            <header className="mx-auto pt-8 lg:pt-0">
                <div className="mb-8 flex w-full flex-col border-b border-emphasis pb-8">
                    <h1 className="mb-1 font-cal text-xl font-bold tracking-wide text-foreground-emphasis">
                        Profile
                    </h1>
                    <p className="text-sm mr-4 text-foreground">
                        Manage settings for your Budgetist profile
                    </p>
                </div>
            </header>

            <ProfileForm user={user} />
        </>
    )
}
