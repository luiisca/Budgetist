import Link from "next/link";

import { Button } from "~/components/ui";
import { X } from "lucide-react";

export default function Error({
    searchParams,
}: {
    searchParams: Record<string, string | string[] | undefined> & { error?: string }
}) {
    return (
        <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8 text-default dark:text-dark-neutral">
            <div className="m-auto max-w-md">
                <div className="mx-2 rounded-md border bg-white px-4 py-10 dark:border-dark-350 dark:bg-dark-150 sm:px-10">
                    <div>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <X className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="mt-3 space-y-2 text-center sm:mt-5">
                            <h3
                                className="text-lg font-medium leading-6"
                            >
                                {searchParams?.error ?? 'Error'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-dark-600">An error occurred when logging you in. Head back to the login screen and try again</p>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-6">
                        <Button className="flex w-full justify-center" asChild>
                            <Link href="/auth/login">
                                Go back to login page
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
