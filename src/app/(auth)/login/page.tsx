import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { Github } from "lucide-react";

import { env } from "~/env";
import Button from "~/components/ui/core/button";
import { Input, Label } from "~/components/ui";
import AuthContainer from "~/components/ui/AuthContainer";
import { Alert } from "~/components/ui/alert";
import { auth, signIn } from "../auth";
import SubmitBttn from "../_components/submit-button";
import { checkRateLimitAndReturnError } from "../_lib/check-rate-limit-and-return-error";
import WaitCounter from "../_components/wait-counter";

export default async function Login({
    searchParams,
}: {
    searchParams: Record<string, string | string[] | undefined> & { error?: string; wait?: string }
}) {
    return (
        <AuthContainer showLogo heading="Log in to Budgetist" >
            <div className="space-y-5">
                {searchParams.error && (
                    <Alert severity="error" title={searchParams.wait ? <WaitCounter seconds={searchParams.wait} redirectUrl="/login" /> : searchParams.error} />
                )}

                <form
                    action={async () => {
                        "use server"

                        await signIn('github', {
                            redirectTo: '/simulation',
                        })
                    }}
                    className="flex flex-col group gap-2">

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
                action={async (formData: FormData) => {
                    'use server'

                    const email = formData.get('email') as string

                    const error = await checkRateLimitAndReturnError({
                        identifier: email
                    })
                    if (error) {
                        const { message, wait } = JSON.parse(error.message)
                        redirect(`?error=${message}&wait=${wait}`)
                    }

                    const redirectUrl = await signIn('nodemailer', {
                        redirectTo: '/simulation',
                        redirect: false,
                        email,
                    })

                    if (redirectUrl) {
                        redirect(`/auth-verify?email=${email}`)
                    } else {
                        redirect(`?error='Oh oh, something went wrong. Please try again`)
                    }
                }}
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

                <SubmitBttn className="flex w-full justify-center">Send email</SubmitBttn>
            </form>
        </AuthContainer>
    )
}

