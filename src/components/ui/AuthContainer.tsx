import classNames from "classnames";
import React from "react";

import { LOGO } from "utils/constants";

import Loader from "components/Loader";
import Image from "next/image";

interface Props {
  footerText?: React.ReactNode | string;
  showLogo?: boolean;
  heading?: string;
  loading?: boolean;
}

export default function AuthContainer(props: React.PropsWithChildren<Props>) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#f3f4f6] from-dark-350 to-dark-100 py-12 dark:bg-gradient-to-b sm:px-6 lg:px-8">
      {props.showLogo && (
        <Image
          src={LOGO}
          alt="Budgetist Logo"
          height={78}
          width={256}
          className="mx-auto mb-auto h-auto w-[15%] min-w-56 dark:invert"
        />
      )}
      <div
        className={classNames(
          props.showLogo ? "text-center" : "",
          "sm:mx-auto sm:w-full sm:max-w-md"
        )}
      >
        {props.heading && (
          <h2 className="text-center font-cal text-3xl text-neutral-900 dark:text-dark-neutral">
            {props.heading}
          </h2>
        )}
      </div>
      {props.loading && (
        <div className="absolute z-50 flex h-screen w-full items-center bg-gray-50">
          <Loader />
        </div>
      )}
      <div className="mt-8 mb-auto dark:mt-0 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-2 rounded-md border border-gray-200 bg-white px-4 py-10 dark:border-0 dark:bg-transparent sm:px-10">
          {props.children}
        </div>
        <div className="mt-8 text-center text-sm text-neutral-600">
          {props.footerText}
        </div>
      </div>
    </div>
  );
}
