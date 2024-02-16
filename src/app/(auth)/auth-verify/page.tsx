import { MailOpen } from "lucide-react";

import { cn } from "~/utils/cn";

import { Button } from "~/components/ui";

export default async function Verify() {
    return (
        <div className="h-[100vh] w-full">
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
                            <Button
                                color="minimal"
                                className="underline"
                            // loading={mutation.isPending}
                            // onClick={() => {
                            //     showToast("Send email", "success");
                            //     mutation.mutate();
                            // }}>
                            >
                                Resend Email
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
