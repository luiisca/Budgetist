import classNames from "classnames";
import ErrorBoundary from "components/ui/ErrorBoundary";
import { useRouter } from "next/router";
import React, { ComponentProps, useEffect, useState } from "react";
import { FiArrowLeft, FiMenu, FiUser } from "react-icons/fi";
import { useMeta } from "../Meta";

import Button from "../Button";
import VerticalTabItem, {
  VerticalTabItemProps,
} from "../navigation/tabs/VerticalTabItem";
import Shell from "../Shell";

const tabs: VerticalTabItemProps[] = [
  {
    name: "My Account",
    href: "/settings/my-account",
    icon: FiUser,
    children: [
      { name: "Profile", href: "/settings/my-account/profile" },
      { name: "Simulation", href: "/settings/my-account/simulation" },
    ],
  },
];

const SettingsSidebarContainer = ({ className = "" }) => {
  return (
    <nav
      className={`no-scrollbar flex w-56 flex-col space-y-1 overflow-scroll py-3 px-2 ${className}`}
      aria-label="Tabs"
    >
      <>
        <div className="desktop-only pt-4" />
        <VerticalTabItem
          name="Back"
          href="/."
          icon={FiArrowLeft}
          textClassNames="text-md font-medium leading-none text-black"
          className="w-full"
        />
        {tabs.map((tab) => (
          <React.Fragment key={tab.href}>
            <div className={`${!tab.children?.length ? "!mb-3" : ""}`}>
              <div className="group flex h-9 w-64 flex-row items-center rounded-md px-3 text-sm font-medium leading-none text-gray-600 hover:bg-gray-100  group-hover:text-gray-700 [&[aria-current='page']]:bg-gray-200 [&[aria-current='page']]:text-gray-900">
                {tab && tab.icon && (
                  <tab.icon className="mr-[12px] h-[16px] w-[16px] stroke-[2px] md:mt-0" />
                )}
                <p className="text-sm font-medium leading-5">{tab.name}</p>
              </div>
            </div>

            <div className="my-3">
              {tab.children?.map((child, index) => (
                <VerticalTabItem
                  key={child.href}
                  name={child.name}
                  isExternalLink={child.isExternalLink}
                  href={child.href || "/"}
                  textClassNames="px-3 text-gray-900 font-medium text-sm"
                  className={`my-0.5 h-7 ${
                    tab.children &&
                    index === tab.children?.length - 1 &&
                    "!mb-3"
                  }`}
                  disableChevron
                />
              ))}
            </div>
          </React.Fragment>
        ))}
      </>
    </nav>
  );
};

const MobileSettingsContainer = (props: {
  onSideContainerOpen?: () => void;
}) => {
  return (
    <>
      <nav className="fixed z-20 flex w-full items-center justify-between border-b border-gray-100 bg-gray-50 p-4 sm:relative lg:hidden">
        <div className="flex items-center space-x-3 ">
          <Button
            StartIcon={FiMenu}
            color="minimalSecondary"
            size="icon"
            onClick={props.onSideContainerOpen}
          />
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="flex items-center space-x-2 rounded-md px-3 py-1 hover:bg-gray-200"
          >
            <FiArrowLeft className="text-gray-700" />
            <p className="font-semibold text-black">Settings</p>
          </a>
        </div>
      </nav>
    </>
  );
};

export default function SettingsLayout({
  children,
  ...rest
}: { children: React.ReactNode } & ComponentProps<typeof Shell>) {
  const router = useRouter();
  const state = useState(false);
  const [sideContainerOpen, setSideContainerOpen] = state;

  useEffect(() => {
    const closeSideContainer = () => {
      if (window.innerWidth >= 1024) {
        setSideContainerOpen(false);
      }
    };

    window.addEventListener("resize", closeSideContainer);
    return () => {
      window.removeEventListener("resize", closeSideContainer);
    };
  }, [sideContainerOpen, setSideContainerOpen]);

  useEffect(() => {
    if (sideContainerOpen) {
      setSideContainerOpen(!sideContainerOpen);
    }
  }, [router.asPath, setSideContainerOpen]);

  return (
    <Shell
      flexChildrenContainer
      {...rest}
      SidebarContainer={<SettingsSidebarContainer className="hidden lg:flex" />}
      drawerState={state}
      MobileNavigationContainer={null}
      SettingsSidebarContainer={
        <div
          className={classNames(
            "fixed inset-y-0 z-50 m-0 h-screen w-56 transform overflow-hidden border-gray-100 bg-gray-50 transition duration-200 ease-in-out",
            sideContainerOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SettingsSidebarContainer />
        </div>
      }
      TopNavContainer={
        <MobileSettingsContainer
          onSideContainerOpen={() => setSideContainerOpen(!sideContainerOpen)}
        />
      }
    >
      <div className="flex flex-1 [&>*]:flex-1">
        <div className="mx-auto max-w-full justify-center md:max-w-3xl">
          <ShellHeader />
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </div>
    </Shell>
  );
}

export const getLayout = (page: React.ReactElement) => (
  <SettingsLayout>{page}</SettingsLayout>
);

function ShellHeader() {
  const { meta } = useMeta();
  return (
    <header className="mx-auto block justify-between pt-12 sm:flex sm:pt-8">
      <div className="mb-8 flex w-full items-center border-b border-gray-200 pb-8">
        {meta.backButton && (
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a href="javascript:history.back()">
            <FiArrowLeft className="mr-7" />
          </a>
        )}
        <div>
          {meta.title ? (
            <>
              <h1 className="mb-1 font-cal text-xl font-bold tracking-wide text-black">
                {meta.title}
              </h1>
            </>
          ) : (
            <div className="mb-1 h-6 w-24 animate-pulse rounded-md bg-gray-200" />
          )}
          {meta.description ? (
            <p className="text-sm text-gray-600 ltr:mr-4 rtl:ml-4">
              {meta.description}
            </p>
          ) : (
            <div className="mb-1 h-6 w-32 animate-pulse rounded-md bg-gray-200" />
          )}
        </div>
        <div className="ml-auto">{meta.CTA}</div>
      </div>
    </header>
  );
}
