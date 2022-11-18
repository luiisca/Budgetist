import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as Tooltip from "@radix-ui/react-tooltip";
import crypto from "crypto";
import { Check } from "react-feather";

import classNames from "classnames";

import { Maybe } from "@trpc/server";

export type AvatarProps = {
  className?: string;
  size: "sm" | "md" | "mdLg" | "lg";
  imageSrc?: Maybe<string>;
  title?: string;
  alt: string;
  gravatarFallbackMd5?: string;
  accepted?: boolean;
};

const sizesPropsBySize = {
  sm: "w-6", // 24px
  md: "w-8", // 32px
  mdLg: "w-10", //40px
  lg: "w-16", // 64px
} as const;

export const defaultAvatarSrc = function ({
  email,
  md5,
}: {
  md5?: string;
  email?: string;
}) {
  if (!email && !md5) return "";

  if (email && !md5) {
    md5 = crypto.createHash("md5").update(email).digest("hex");
  }

  return `https://www.gravatar.com/avatar/${md5}?s=160&d=mp&r=PG`;
};

export function getPlaceholderAvatar(
  avatar: string | null | undefined,
  name: string | null
) {
  return avatar
    ? avatar
    : "https://eu.ui-avatars.com/api/?background=fff&color=f9f9f9&bold=true&background=000000&name=" +
        encodeURIComponent(name || "");
}

export function Avatar(props: AvatarProps) {
  const { imageSrc, gravatarFallbackMd5, size, alt, title } = props;
  const sizeClassname = sizesPropsBySize[size];
  const rootClass = classNames(
    "rounded-full aspect-square",
    sizeClassname,
    "h-auto"
  );
  const avatar = (
    <AvatarPrimitive.Root
      className={classNames(
        sizeClassname,
        "relative inline-block aspect-square overflow-hidden rounded-full dark:bg-darkgray-300"
      )}
    >
      <AvatarPrimitive.Image
        src={imageSrc ?? undefined}
        alt={alt}
        className={rootClass}
      />
      <AvatarPrimitive.Fallback delayMs={600}>
        {gravatarFallbackMd5 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={defaultAvatarSrc({ md5: gravatarFallbackMd5 })}
            alt={alt}
            className={rootClass}
          />
        )}
      </AvatarPrimitive.Fallback>
      {props.accepted && (
        <div
          className={classNames(
            "absolute bottom-0 right-0 block rounded-full bg-green-400 text-white ring-2 ring-white",
            size === "lg" ? "h-5 w-5" : "h-2 w-2"
          )}
        >
          <div className="flex h-full items-center justify-center p-[2px]">
            {size === "lg" && <Check className="" />}
          </div>
        </div>
      )}
    </AvatarPrimitive.Root>
  );

  return title ? (
    <Tooltip.Provider>
      <Tooltip.Tooltip delayDuration={300}>
        <Tooltip.TooltipTrigger className="cursor-default">
          {avatar}
        </Tooltip.TooltipTrigger>
        <Tooltip.Content className="rounded-sm bg-black p-2 text-sm text-white shadow-sm">
          <Tooltip.Arrow />
          {title}
        </Tooltip.Content>
      </Tooltip.Tooltip>
    </Tooltip.Provider>
  ) : (
    <>{avatar}</>
  );
}
