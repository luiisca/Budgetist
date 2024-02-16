import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "~/components/ui";
import AuthContainer from "~/components/ui/AuthContainer";

export default async function Logout() {
    return (
        <AuthContainer showLogo>
            <div className="mb-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500 bg-opacity-30">
                    <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                    <h3
                        className="text-lg font-medium leading-6 text-gray-900 dark:text-dark-neutral"
                        id="modal-title"
                    >
                        You&apos;ve been logged out
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-dark-600">
                            We hope to see you again soon!
                        </p>
                    </div>
                </div>
            </div>
            <Button className="flex w-full justify-center">
                <Link href='/login'>Go back to login page</Link>
            </Button>
        </AuthContainer>
    )
}

