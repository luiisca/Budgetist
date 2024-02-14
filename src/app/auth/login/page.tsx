import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCsrfToken } from "next-auth/react";
import { Github } from "lucide-react";

import { env } from "~/env";
import { getServerAuthSession } from "~/server/auth";

import Button from "~/components/ui/core/button";
import { Input, Label } from "~/components/ui";
import SubmitBttn from "../_components/submit-bttn"
import AuthContainer from "~/components/ui/AuthContainer";
import { Alert } from "~/components/ui/alert";

export default async function Login({
    searchParams,
}: {
    searchParams: Record<string, string | string[] | undefined> & { error: string }
}) {
    const session = await getServerAuthSession();
    if (session?.user) {
        return redirect('/simulation')
    }

    const csrfToken = await getCsrfToken({
        req: {
            headers: {
                cookie: cookies().toString()
            }
        }
    })

    return (
        <AuthContainer showLogo heading="Log in to Budgetist" >
            <div className="space-y-5">
                {searchParams.error && (
                    <Alert severity="error" title={searchParams.error} />
                )}
                <form
                    method="POST"
                    action={`${env.NEXTAUTH_URL}/api/auth/signin/github?callbackUrl=${env.NEXTAUTH_URL}/simulation`}
                    className="flex flex-col group gap-2">

                    <input
                        hidden
                        value={csrfToken}
                        name="csrfToken"
                        readOnly />

                    <Button
                        color="secondary"
                        className="flex w-full justify-center"
                        StartIcon={Github}
                    >
                        Log in with Github
                    </Button>
                </form>
            </div>
            <div className="relative my-6">
                <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                >
                    <div className="w-full border-t border-gray-300 dark:border-dark-350" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-sm text-gray-500 dark:bg-transparent dark:text-transparent">
                        or
                    </span>
                </div>
            </div>
            <form
                method="POST"
                action={`${env.NEXTAUTH_URL}/api/auth/signin/email?callbackUrl=${env.NEXTAUTH_URL}/simulation`}
                id='auth-form'
            >

                <Label htmlFor="email" className="pl-1">Magic Link</Label>
                <div className="relative w-full mb-6">
                    <Input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="hello@email.com"
                        autoComplete="email"
                        inputMode="email"
                        required
                        className="dark:focus:invalid:border-dark-destructive-100 focus:invalid:ring-dark-destructive-100"
                    />
                </div>

                <input
                    hidden
                    value={csrfToken}
                    name="csrfToken"
                    readOnly />

                <SubmitBttn className="flex w-full justify-center">Send email</SubmitBttn>
            </form>
        </AuthContainer>
    )
}

