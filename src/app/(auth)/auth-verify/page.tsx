import { MailOpen } from "lucide-react";

import { cn } from "~/utils/cn";

import { redirect } from "next/navigation";

import { Alert } from "~/components/ui/alert";
import { auth, signIn } from "../auth";
import SubmitBttn from "../_components/submit-button";
import { checkRateLimitAndReturnError } from "../_lib/check-rate-limit-and-return-error";
import WaitCounter from "../_components/wait-counter";

export default async function Verify({
    searchParams,
}: {
    searchParams: Record<string, string | string[] | undefined> & { error?: string; wait?: string, email: string }
}) {
    return (
        <div className="h-[100vh] w-full">
            {searchParams.error && (
                <Alert severity="error" title={searchParams.wait ? <WaitCounter seconds={searchParams.wait} redirectUrl={`/auth-verify?email=${searchParams.email}`} /> : searchParams.error} />
            )}
            <div className="flex h-full w-full flex-col items-center justify-center">
                <div className="max-w-3xl">
                    <div
                        className={cn(
                            "bg-default flex w-full select-none flex-col items-center justify-center rounded-lg p-7 lg:p-20",
                            "border-subtle border",
                        )}>
                        <div className="bg-emphasis flex h-[72px] w-[72px] items-center justify-center rounded-full ">
                            <MailOpen className="text-default inline-block h-10 w-10 stroke-[1.3px]" />
                        </div>
                        <div className="flex max-w-[420px] flex-col items-center">
                            <h2
                                className={cn(
                                    "text-semibold font-cal text-emphasis text-center text-xl",
                                    "mt-6"
                                )}>
                                Check your email
                            </h2>
                            <div className="text-default mb-8 mt-3 text-center text-sm font-normal leading-6">
                                description
                            </div>
                            <form
                                action={async () => {
                                    'use server'

                                    const email = searchParams.email

                                    const error = await checkRateLimitAndReturnError({
                                        identifier: email
                                    })
                                    if (error) {
                                        const { message, wait } = JSON.parse(error.message)
                                        redirect(`?error=${message}&wait=${wait}&email=${email}`)
                                    }

                                    await signIn('nodemailer', {
                                        redirectTo: '/simulation',
                                        redirect: false,
                                        email,
                                    })
                                }}
                            >
                                <SubmitBttn
                                    error={!!searchParams.error}
                                    color="minimal"
                                    className="underline"
                                >
                                    Resend Email
                                </SubmitBttn>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
