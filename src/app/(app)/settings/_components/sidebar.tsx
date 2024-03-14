import { Fragment } from "react";
import { ArrowLeft, User } from "lucide-react"
import VerticalTabItem, { TabItemPropsType } from "./vertical-tab-item";
import { cn } from "~/lib/cn";
import Link from "next/link";
import { auth } from "~/app/(auth)/auth";

const tabs: TabItemPropsType[] = [
    {
        name: "My Account",
        href: "/settings",
        icon: User,
        children: [
            { name: "Profile", href: "/settings/profile" },
            { name: "Simulation", href: "/settings/simulation" },
        ],
    },
];

function BackVerticalTabItem() {
    return (
        <Link
            href='/simulation'
            className="my-2 flex h-6 min-h-9 w-full flex-row rounded-md px-3 py-[10px] font-medium leading-none hover:bg-subtle text-foreground-emphasis"
        >
            <ArrowLeft className="mr-[10px] h-4 w-4 md:mt-0" />
            <div className="h-fit">
                <span className="flex items-center space-x-2">
                    <p className="min-h-4 max-w-36 truncate">
                        Back
                    </p>
                </span>
            </div>
        </Link>
    )
}

export default async function Sidebar({ className }: { className?: string }) {
    const session = await auth()

    return (
        <aside className={cn(
            "h-full w-56 border-r border-transparent bg-muted",
            className)}
        >
            <nav
                className="no-scrollbar flex flex-col space-y-4 overflow-scroll px-2 py-3"
                aria-label="Tabs"
            >
                <BackVerticalTabItem />
                {tabs.map((tab) => (
                    <div key={tab.href} className="space-y-1">
                        <div className={cn(
                            !tab.children?.length && "!mb-3"
                        )}>
                            <div
                                className={cn(
                                    "flex h-9 w-64 flex-row items-center rounded-md px-3 text-sm font-medium leading-none text-foreground",
                                )}
                            >
                                <span
                                    className={cn(
                                        "mr-3 h-4 min-h-4 w-4 min-w-4 md:mt-0",
                                        "relative flex-shrink-0 rounded-full bg-gray-300 "
                                    )}
                                >
                                    {
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            className="rounded-full"
                                            src={session?.user?.image ?? ''}
                                            alt={session?.user?.username ?? "Nameless User"}
                                        />
                                    }
                                </span>
                                <p className="text-sm font-medium leading-5">{session?.user.name}</p>
                            </div>
                        </div>

                        <div>
                            {tab.children?.map(({ href, name }, index) => (
                                <VerticalTabItem
                                    key={href}
                                    name={name}
                                    href={href || "/"}
                                    className={cn('my-0.5 h-7 px-3 text-sm font-medium',
                                        tab.children &&
                                        index === tab.children?.length - 1 &&
                                        "!mb-3",
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
