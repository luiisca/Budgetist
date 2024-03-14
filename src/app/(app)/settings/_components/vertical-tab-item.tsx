'use client'

import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

import { cn } from "~/lib/cn";

export type TabItemPropsType = {
    name: string;
    info?: string;
    icon?: LucideIcon;
    children?: TabItemPropsType[];
    className?: string;
    href: string;
    linkProps?: Omit<ComponentProps<typeof Link>, "href">;
};

const VerticalTabItem = function({
    name,
    href,
    info,
    linkProps,
    ...props
}: TabItemPropsType) {
    const pathName = usePathname();

    return (
        <Link
            key={name}
            href={href}
            {...linkProps}
            className={cn(
                "flex h-6 min-h-9 w-full flex-row rounded-md px-3 py-[10px] font-medium leading-none text-foreground hover:bg-subtle hover:text-foreground-emphasis",
                pathName === href && "bg-emphasis text-foreground-emphasis hover:bg-emphasis",
                !props.icon && "ml-7 mr-4 w-auto",
                props.className
            )}
            aria-current={pathName === href ? "page" : undefined}
        >
            {props.icon && (
                <props.icon className="mr-[10px] h-4 w-4 md:mt-0" />
            )}
            <div className="h-fit">
                <span className="flex items-center space-x-2">
                    <p className="min-h-4 max-w-36 truncate">
                        {name}
                    </p>
                </span>
            </div>
        </Link>
    );
};

export default VerticalTabItem;
