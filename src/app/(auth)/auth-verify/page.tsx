import { redirect } from "next/navigation";
import { MailOpen } from "lucide-react";

import { cn } from "~/utils/cn";
import { signIn } from "../auth";
import { checkRateLimitAndReturnError } from "../_lib/check-rate-limit-and-return-error";

import { Alert } from "~/components/ui/alert";
import SubmitBttn from "../_components/submit-button";
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

            <div className="flex h-full w-full flex-col items-center justify-center text-default dark:text-dark-neutral">
                <div className="max-w-3xl m-4 lg:m-10">
                    <div
                        className={cn(
                            "bg-white dark:bg-dark-150 flex w-full select-none flex-col items-center justify-center p-7 lg:p-20 ",
                            "border rounded-lg dark:border-dark-350 ",
                        )}>
                        <div className="bg-emphasis flex h-[72px] w-[72px] items-center justify-center rounded-full ">
                            <MailOpen className="inline-block h-10 w-10 stroke-[1.3px]" />
                        </div>
                        <div className="flex max-w-[420px] flex-col items-center">
                            <h2
                                className={cn(
                                    "text-semibold font-cal text-center text-xl",
                                    "mt-6"
                                )}>
                                Check your email
                            </h2>
                            <p className="mb-8 mt-3 text-center text-sm font-normal leading-6">

                                We have sent an email to <b>{searchParams.email}</b> with a link to activate your
                                account.
                            </p>
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
