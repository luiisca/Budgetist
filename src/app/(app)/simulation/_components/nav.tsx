'use client'

import { LucideIcon, Play, Settings } from "lucide-react"
import Link from "next/link";
import { usePathname} from "next/navigation";
import { cn } from "~/lib/cn";

type TNavigationItem = {
    name: string;
    href: string;
    icon?: LucideIcon;
};

const navigation: TNavigationItem[] = [
    {
        name: "Simulation",
        href: "/simulation",
        icon: Play,
    },
    {
        name: "Settings",
        href: "/settings",
        icon: Settings,
    },
];

function NavItem({item}: {item: TNavigationItem}) {
    const pathname = usePathname();
    const current = pathname.startsWith(item.href);

    return  (
        <Link
            href={item.href}
            aria-label={item.name}
            className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground lg:px-[14px]",
                "hover:bg-subtle hover:text-foreground-emphasis",

                current &&
                "bg-emphasis text-foreground-emphasis hover:bg-emphasis"
            )}
            aria-current={current ? "page" : undefined}
        >
            {item.icon && (
                <item.icon
                    className={cn(
                        "mr-3 h-4 w-4 flex-shrink-0",
                    )}
                    aria-hidden="true"
                    aria-current={current ? "page" : undefined}
                />
            )}
            <span className="hidden w-full justify-between lg:flex">
                <div className="flex">{item.name}</div>
            </span>
        </Link>
    )
}

export default function Nav() {
    return (
        <nav className="mt-2 flex-1 space-y-1 md:px-2 lg:mt-5 lg:px-0">
            {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
            ))}
        </nav>
    );
};
