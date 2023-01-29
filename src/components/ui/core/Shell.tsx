import { signOut, useSession } from "next-auth/react";
import { NextRouter, useRouter } from "next/router";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import useMeQuery from "server/trpc/hooks/useMeQuery";
import Logo from "../logo";
import {
  FiArrowLeft,
  FiLogOut,
  FiMoreVertical,
  FiPlay,
  FiSettings,
} from "react-icons/fi";
import { SVGComponent } from "types/SVGComponent";
import classNames from "classnames";
import Dropdown, {
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../Dropdown";
import FeedbackMenuItem from "../support/FeedbackMenuItem";
import ErrorBoundary from "../ErrorBoundary";
import Button from "./Button";
import Link from "next/link";
import { noop } from "lodash";
import { useTheme } from "next-themes";

const useRedirectToLoginIfUnauthenticated = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === "loading";

  useEffect(() => {
    if (!loading && !session) {
      router.replace({
        pathname: "/auth/login",
      });
    }
  }, [router, loading, session]);

  return {
    loading: loading && !session,
    session,
  };
};
const useRedirectToOnboardingIfNeeded = () => {
  const router = useRouter();
  const query = useMeQuery();
  const user = query.data;

  const isRedirectingToOnboarding = user && !user.completedOnboarding;

  useEffect(() => {
    if (isRedirectingToOnboarding) {
      router.replace({
        pathname: "/getting-started",
      });
    }
  }, [router, isRedirectingToOnboarding]);

  return {
    isRedirectingToOnboarding,
  };
};

type NavigationItemType = {
  name: string;
  href: string;
  icon?: SVGComponent;
};

type DrawerState = [
  isOpen: boolean,
  setDrawerOpen: Dispatch<SetStateAction<boolean>>
];

type LayoutProps = {
  centered?: boolean;
  title?: string;
  heading?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  CTA?: ReactNode;
  balance?: ReactNode;
  large?: boolean;
  SettingsSidebarContainer?: ReactNode;
  MobileNavigationContainer?: ReactNode;
  SidebarContainer?: ReactNode;
  TopNavContainer?: ReactNode;
  drawerState?: DrawerState;
  HeadingLeftIcon?: ReactNode;
  backPath?: string; // renders back button to specified path
  // use when content needs to expand with flex
  flexChildrenContainer?: boolean;
  withoutMain?: boolean;
};

export default function Shell(props: LayoutProps) {
  useRedirectToLoginIfUnauthenticated();
  useRedirectToOnboardingIfNeeded();

  return (
    <div className="flex h-screen overflow-hidden">
      {props.SidebarContainer || <SideBarContainer />}
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <MainContainer {...props} />
      </div>
    </div>
  );
}

function UserDropdown({ small }: { small?: boolean }) {
  const query = useMeQuery();
  const user = query.data;

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  if (!user) {
    return null;
  }
  const onFeedbackItemSelect = () => {
    setFeedbackOpen(false);
    setMenuOpen(false);
  };

  return (
    <Dropdown open={menuOpen} onOpenChange={() => setFeedbackOpen(false)}>
      <DropdownMenuTrigger asChild onClick={() => setMenuOpen(true)}>
        <button
          className={classNames(
            "group flex w-full cursor-pointer appearance-none items-center rounded-full p-2 text-left outline-none sm:ml-1 md:ml-0 md:rounded-md",
            "transition-all hover:bg-gray-100",
            "dark:bg-dark-secondary dark:shadow-darkBorder dark:hover:border-dark-500 dark:hover:bg-dark-tertiary",
            small &&
              "[&:not(:focus-visible)]:dark:border-transparent [&:not(:focus-visible)]:dark:bg-transparent [&:not(:focus-visible)]:dark:shadow-none [&:not(:focus-visible)]:dark:hover:border-dark-500 [&:not(:focus-visible)]:dark:hover:bg-dark-tertiary [&:not(:focus-visible)]:dark:hover:shadow-darkBorder"
          )}
        >
          {/*Avatar*/}
          <span
            className={classNames(
              small ? "h-8 w-8" : "mr-2 h-9 w-9",
              "relative flex-shrink-0 rounded-full bg-gray-300 "
            )}
          >
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="rounded-full"
                src={user.avatar}
                alt={user.username || "Nameless User"}
              />
            }
          </span>
          {/*Text*/}
          {!small && (
            <span className="flex flex-grow items-center truncate">
              <span className="flex-grow truncate text-sm">
                <span className="block truncate font-medium text-gray-900 dark:text-dark-neutral">
                  {user.name || "Nameless User"}
                </span>
                <span className="block truncate font-normal text-neutral-500 dark:text-dark-600">
                  {user.username || undefined}
                </span>
              </span>
              <FiMoreVertical
                className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                aria-hidden="true"
              />
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent onInteractOutside={() => setMenuOpen(false)}>
          {feedbackOpen ? (
            <FeedbackMenuItem
              onFeedbackItemSelect={() => onFeedbackItemSelect()}
            />
          ) : (
            <>
              {/* <DropdownMenuItem> */}
              {/*   <button */}
              {/*     className={classNames( */}
              {/*       "flex w-full items-center px-4 py-2 text-sm" */}
              {/*     )} */}
              {/*     onClick={() => setFeedbackOpen(true)} */}
              {/*   > */}
              {/*     <FiHeart */}
              {/*       className={classNames( */}
              {/*         "mr-2 h-4 w-4 flex-shrink-0", */}
              {/*         "text-gray-500 group-hover:text-neutral-500", */}
              {/*         "dark:text-dark-600 dark:group-hover:text-dark-neutral" */}
              {/*       )} */}
              {/*       aria-hidden="true" */}
              {/*     /> */}
              {/*     Feedback */}
              {/*   </button> */}
              {/* </DropdownMenuItem> */}
              {/**/}
              {/* <DropdownMenuSeparator /> */}

              <DropdownMenuItem>
                <a
                  onClick={() => signOut({ callbackUrl: "/auth/logout" })}
                  className="group flex cursor-pointer items-center px-4 py-2"
                >
                  <FiLogOut
                    className={classNames(
                      "mr-2 h-4 w-4 flex-shrink-0",
                      "text-gray-500 group-hover:text-neutral-500",
                      "dark:text-dark-600 dark:group-hover:text-dark-neutral"
                    )}
                    aria-hidden="true"
                  />
                  Sign out
                </a>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </Dropdown>
  );
}

const navigation: NavigationItemType[] = [
  {
    name: "Simulation",
    href: "/simulation",
    icon: FiPlay,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: FiSettings,
  },
];

const isCurrent: ({
  item,
  router,
}: {
  item: NavigationItemType;
  router: NextRouter;
}) => boolean = ({ item, router }) => {
  return router.asPath.startsWith(item.href);
};

const Navigation = () => {
  return (
    <nav className="mt-2 flex-1 space-y-1 md:px-2 lg:mt-5 lg:px-0">
      {navigation.map((item) => (
        <NavigationItem key={item.name} item={item} />
      ))}
    </nav>
  );
};

const NavigationItem: React.FC<{ item: NavigationItemType }> = ({ item }) => {
  const router = useRouter();
  const current = isCurrent({ item, router });

  return (
    <Link
      href={item.href}
      aria-label={item.name}
      className={classNames(
        "group flex items-center rounded-md py-2 px-3 text-sm font-medium lg:px-[14px] ",
        "hover:bg-gray-100",
        "dark:text-dark-800 dark:hover:bg-dark-secondary",

        current &&
          "bg-gray-200 [&[aria-current='page']]:text-brand-900 [&[aria-current='page']]:hover:bg-gray-200 dark:[&[aria-current='page']]:bg-dark-secondary  dark:[&[aria-current='page']]:text-dark-800 "
      )}
      aria-current={current ? "page" : undefined}
    >
      {item.icon && (
        <item.icon
          className={classNames(
            "mr-3 h-4 w-4 flex-shrink-0 text-gray-500",
            "dark:text-dark-600 dark:group-hover:text-dark-neutral",
            current && "text-inherit"
          )}
          aria-hidden="true"
          aria-current={current ? "page" : undefined}
        />
      )}
      <span className="hidden w-full justify-between lg:flex">
        <div className="flex">{item.name}</div>
      </span>
    </Link>
  );
};

// function MobileNavigationContainer() {
//   const { status } = useSession();
//   if (status !== "authenticated") return null;
//   return <MobileNavigation />;
// }
//
// const MobileNavigation = () => {
//   return (
//     <>
//       <nav
//         className={classNames(
//           "bottom-nav fixed bottom-0 z-30 -mx-4 flex w-full border border-t border-gray-200 bg-gray-50 bg-opacity-40 px-1 shadow backdrop-blur-md md:hidden",
//           isEmbed && "hidden"
//         )}
//       >
//         {navigation.map((item) => (
//           <MobileNavigationItem key={item.name} item={item} />
//         ))}
//       </nav>
//       {/* add padding to content for mobile navigation*/}
//       <div className="block pt-12 md:hidden" />
//     </>
//   );
// };
function ThemeButton({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => setMounted(true));

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className={classNames(
        className || "",
        "flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 ring-gray-300 transition-all [&:not(:focus-visible)]:hover:ring-1",
        "dark:bg-dark-secondary dark:ring-dark-400 dark:focus-visible:ring-dark-accent-200 [&:not(:focus-visible)]:dark:hover:ring-dark-500"
      )}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="h-5 w-5 text-gray-800 dark:text-gray-200"
        >
          {resolvedTheme === "dark" ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          )}
        </svg>
      )}
    </button>
  );
}

function SideBarContainer() {
  const { status } = useSession();

  if (status !== "loading" && status !== "authenticated") return null;

  return <SideBar />;
}

function SideBar() {
  return (
    <aside
      className={classNames(
        "relative hidden w-14 flex-col border-r md:flex lg:w-56 lg:flex-shrink-0 lg:px-4",
        "border-gray-100 bg-gray-50",
        "dark:border-dark-350 dark:bg-dark-primary"
      )}
    >
      <div className="flex h-0 flex-1 flex-col pt-3 pb-4 lg:pt-5">
        <header className="items-center justify-between md:hidden lg:flex">
          <Link href="/simulation" className="px-4">
            <Logo />
          </Link>
          <ThemeButton className="absolute right-4 hidden lg:flex" />
        </header>

        {/* logo icon for tablet */}
        <Link href="/simulation" className="text-center md:inline lg:hidden">
          <Logo small icon />
        </Link>

        <Navigation />
      </div>

      <div className="mb-2 flex flex-col items-center">
        <ThemeButton className="mb-2 lg:hidden" />
        <span className="hidden w-full lg:inline">
          <UserDropdown />
        </span>
        <span className="hidden md:inline lg:hidden">
          <UserDropdown small />
        </span>
      </div>
    </aside>
  );
}

export function ShellMain(props: LayoutProps) {
  const router = useRouter();

  return (
    <>
      <div className="flex items-baseline sm:mt-0">
        {!!props.backPath && (
          <Button
            size="icon"
            color="minimal"
            onClick={() => router.push(props.backPath as string)}
            StartIcon={FiArrowLeft}
            aria-label="Go Back"
            className="mr-2"
          />
        )}
        {props.heading && (
          <header
            className={classNames(
              props.large && "py-8",
              "mb-4 flex w-full items-center pt-4 md:p-0 lg:mb-10"
            )}
          >
            {props.HeadingLeftIcon && (
              <div className="mr-4">{props.HeadingLeftIcon}</div>
            )}
            <div className="mr-4 w-full sm:block">
              {props.heading && (
                <h1
                  className={classNames(
                    "mb-1  font-cal text-xl font-bold capitalize tracking-wide text-black",
                    "dark:text-dark-neutral"
                  )}
                >
                  {props.heading}
                </h1>
              )}
              {props.subtitle && (
                <p className="hidden text-sm text-neutral-500 dark:text-dark-600 sm:block">
                  {props.subtitle}
                </p>
              )}
            </div>
            {(props.CTA || props.balance) && (
              <div
                className={classNames(
                  props.backPath ? "relative" : "fixed",
                  props.CTA && "cta",
                  "mb-4 flex-shrink-0 sm:relative sm:bottom-auto sm:right-auto"
                )}
              >
                {props.CTA || props.balance}
              </div>
            )}
          </header>
        )}
      </div>
      {/* <div */}
      {/*   className={classNames( */}
      {/*     props.flexChildrenContainer && "flex flex-1 flex-col", */}
      {/*   )} */}
      {/* > */}
      {/* </div> */}
      {props.children}
    </>
  );
}

const SettingsSidebarContainerDefault = () => null;

function MainContainer({
  SettingsSidebarContainer: SettingsSidebarContainerProp = (
    <SettingsSidebarContainerDefault />
  ),
  // MobileNavigationContainer: MobileNavigationContainerProp = (
  //   <MobileNavigationContainer />
  // ),
  MobileNavigationContainer: MobileNavigationContainerProp,
  TopNavContainer: TopNavContainerProp = <TopNavContainer />,
  ...props
}: LayoutProps) {
  const [sideContainerOpen, setSideContainerOpen] = props.drawerState || [
    false,
    noop,
  ];

  return (
    <main className="relative z-0 flex flex-1 flex-col overflow-y-auto bg-white focus:outline-none  dark:bg-dark-primary">
      {/* show top navigation for md and smaller (tablet and phones) */}
      {TopNavContainerProp}

      <div
        className={classNames(
          "absolute z-40 m-0 h-screen w-screen opacity-50",
          !sideContainerOpen && "hidden"
        )}
        onClick={() => {
          setSideContainerOpen(false);
        }}
      />
      {SettingsSidebarContainerProp}

      <div className="flex h-screen flex-col px-4 py-2 lg:py-8 lg:px-12">
        <ErrorBoundary>
          {/* add padding to top for mobile when App Bar is fixed */}
          <div className="pt-14 sm:hidden" />
          {!props.withoutMain ? (
            <ShellMain {...props}>{props.children}</ShellMain>
          ) : (
            props.children
          )}
        </ErrorBoundary>

        {/* show bottom navigation for md and smaller (tablet and phones) on pages where back button doesn't exist */}
        {/* {!props.backPath ? MobileNavigationContainerProp : null} */}
      </div>
    </main>
  );
}

function TopNavContainer() {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return <TopNav />;
}

function TopNav() {
  return (
    <>
      <nav className="fixed z-40 flex w-full items-center justify-between border-b border-gray-200 bg-gray-50 bg-opacity-50 py-1.5 px-4 backdrop-blur-lg dark:border-dark-350 dark:bg-dark-primary sm:relative sm:p-4 md:hidden">
        <Link href="/simulation">
          <Logo />
        </Link>
        <div className="flex items-center gap-2 self-center">
          <ThemeButton className="flex-shrink-0 md:hidden" />
          <button className={classNames("group rounded-full p-1")}>
            <Link href="/settings/my-account/profile" tabIndex={-1}>
              <FiSettings
                className="h-4 w-4 text-gray-600 dark:text-dark-600 dark:group-hover:text-dark-neutral"
                aria-hidden="true"
              />
            </Link>
          </button>
          <UserDropdown small />
        </div>
      </nav>
    </>
  );
}
