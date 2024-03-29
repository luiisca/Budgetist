import classNames from "classnames";
import React, { ReactNode } from "react";
import { Icon } from "react-feather";
import { IconType } from "react-icons";
import { SVGComponent } from "types/SVGComponent";
import Button from "./Button";

export default function EmptyScreen({
  Icon,
  headline,
  description,
  buttonText,
  buttonOnClick,
  buttonRaw,
}: {
  Icon: SVGComponent | Icon | IconType;
  headline: string;
  description: string | React.ReactElement;
  buttonText?: string;
  buttonOnClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  buttonRaw?: ReactNode; // Used incase you want to provide your own button.
}) {
  return (
    <>
      <div
        className={classNames(
          "flex min-h-80 w-full flex-col items-center justify-center rounded-md border border-dashed p-7 lg:p-20",
          "dark:border-dark-300 dark:bg-dark-250"
        )}
      >
        <div
          className={classNames(
            "flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gray-200",
            "dark:bg-dark-secondary"
          )}
        >
          <Icon className="inline-block h-10 w-10 stroke-[1.3px] dark:text-dark-neutral" />
        </div>
        <div className="flex max-w-[420px] flex-col items-center">
          <h2 className="text-semibold mt-6 font-cal text-xl dark:text-dark-neutral">
            {headline}
          </h2>
          <p className="mt-3 mb-8 text-center text-sm font-normal leading-6 text-gray-700 dark:text-dark-600">
            {description}
          </p>
          {buttonOnClick && buttonText && (
            <Button onClick={(e) => buttonOnClick(e)}>{buttonText}</Button>
          )}
          {buttonRaw}
        </div>
      </div>
    </>
  );
}
