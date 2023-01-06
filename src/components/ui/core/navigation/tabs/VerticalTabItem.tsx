import Link from "next/link";
import { useRouter } from "next/router";
import { ComponentProps, Fragment } from "react";

import classNames from "classnames";
import { SVGComponent } from "types/SVGComponent";
import { FiChevronRight, FiExternalLink } from "react-icons/fi";

export type VerticalTabItemProps = {
  name: string;
  info?: string;
  icon?: SVGComponent;
  disabled?: boolean;
  children?: VerticalTabItemProps[];
  textClassNames?: string;
  className?: string;
  isChild?: boolean;
  hidden?: boolean;
  disableChevron?: boolean;
  href: string;
  isExternalLink?: boolean;
  linkProps?: Omit<ComponentProps<typeof Link>, "href">;
};

const VerticalTabItem = function ({
  name,
  href,
  info,
  disableChevron,
  linkProps,
  ...props
}: VerticalTabItemProps) {
  const { asPath } = useRouter();
  const isCurrent = asPath.startsWith(href);

  return (
    <Fragment key={name}>
      {!props.hidden && (
        <>
          <Link
            key={name}
            href={href}
            {...linkProps}
            target={props.isExternalLink ? "_blank" : "_self"}
            className={classNames(
              props.textClassNames ||
                "text-sm font-medium leading-none text-gray-600",
              "group flex min-h-9 flex-row rounded-md px-3 py-[10px] group-hover:text-gray-700 hover:bg-gray-100 [&[aria-current='page']]:bg-gray-200 [&[aria-current='page']]:text-gray-900",
              "dark:text-dark-800 dark:hover:bg-dark-secondary",
              "dark:[&[aria-current='page']]:bg-dark-secondary  dark:[&[aria-current='page']]:text-dark-800 ",
              props.disabled && "pointer-events-none !opacity-30",
              (props.isChild || !props.icon) && "ml-7 mr-4 w-auto",
              !info ? "h-6" : "h-14",
              props.className
            )}
            aria-current={isCurrent ? "page" : undefined}
          >
            {props.icon && (
              <props.icon className="mr-[10px] h-[16px] w-[16px] stroke-[2px] md:mt-0" />
            )}
            <div className="h-fit">
              <span className="flex items-center space-x-2">
                <p className="min-h-4 max-w-36 truncate dark:text-dark-neutral">
                  {name}
                </p>
                {props.isExternalLink ? <FiExternalLink /> : null}
              </span>
              {info && (
                <p className="mt-1 max-w-44 truncate text-xs font-normal">
                  {info}
                </p>
              )}
            </div>
            {!disableChevron && isCurrent && (
              <div className="ml-auto self-center">
                <FiChevronRight
                  width={20}
                  height={20}
                  className="h-auto w-[20px] stroke-[1.5px] text-gray-700"
                />
              </div>
            )}
          </Link>
        </>
      )}
    </Fragment>
  );
};

export default VerticalTabItem;
