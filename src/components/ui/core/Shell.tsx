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
  FiArrowRight,
  FiHeart,
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
  DropdownMenuSeparator,
} from "../Dropdown";
import FeedbackMenuItem from "../support/FeedbackMenuItem";
import ErrorBoundary from "../ErrorBoundary";
import Button from "./Button";
import Link from "next/link";
import { noop } from "lodash";

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
        <button className="group flex w-full cursor-pointer appearance-none items-center rounded-full p-2 text-left outline-none hover:bg-gray-100 sm:pl-3 md:rounded-none lg:pl-2">
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
                <span className="block truncate font-medium text-gray-900">
                  {user.name || "Nameless User"}
                </span>
                <span className="block truncate font-normal text-neutral-500">
                  {user.username || undefined}
                </span>
              </span>
              <FiMoreVertical
                className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
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
              <button
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setFeedbackOpen(true)}
              >
                <FiHeart
                  className={classNames(
                    "text-gray-500 group-hover:text-neutral-500",
                    "h-4 w-4 flex-shrink-0 ltr:mr-2"
                  )}
                  aria-hidden="true"
                />
                Feedback
              </button>

              <DropdownMenuSeparator className="h-px bg-gray-200" />

              <DropdownMenuItem>
                <a
                  onClick={() => signOut({ callbackUrl: "/auth/logout" })}
                  className="flex cursor-pointer items-center px-4 py-2 text-sm hover:bg-gray-100 hover:text-gray-900"
                >
                  <FiLogOut
                    className={classNames(
                      "text-gray-500 group-hover:text-gray-700",
                      "mr-2 h-4 w-4 flex-shrink-0 "
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
    <Link href={item.href}>
      <a
        aria-label={item.name}
        className={classNames(
          "group flex items-center rounded-md py-2 px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 lg:px-[14px] [&[aria-current='page']]:bg-gray-200  [&[aria-current='page']]:text-brand-900 [&[aria-current='page']]:hover:text-neutral-900"
        )}
        aria-current={current ? "page" : undefined}
      >
        {item.icon && (
          <item.icon
            className="mr-3 h-4 w-4 flex-shrink-0 text-gray-500 [&[aria-current='page']]:text-inherit"
            aria-hidden="true"
            aria-current={current ? "page" : undefined}
          />
        )}
        <span className="hidden w-full justify-between lg:flex">
          <div className="flex">{item.name}</div>
        </span>
      </a>
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

function SideBarContainer() {
  const { status } = useSession();

  if (status !== "loading" && status !== "authenticated") return null;

  return <SideBar />;
}

function SideBar() {
  return (
    <aside className="hidden w-14 flex-col border-r border-gray-100 bg-gray-50 md:flex lg:w-56 lg:flex-shrink-0 lg:px-4">
      <div className="flex h-0 flex-1 flex-col overflow-y-auto pt-3 pb-4 lg:pt-5">
        <header className="items-center justify-between md:hidden lg:flex">
          <Link href="/simulation">
            <a className="px-4">
              <Logo />
            </a>
          </Link>
          <div className="flex space-x-2">
            <button
              color="minimal"
              onClick={() => window.history.back()}
              className="desktop-only group flex text-sm font-medium text-neutral-500  hover:text-neutral-900"
            >
              <FiArrowLeft className="h-4 w-4 flex-shrink-0 text-neutral-500 group-hover:text-neutral-900" />
            </button>
            <button
              color="minimal"
              onClick={() => window.history.forward()}
              className="desktop-only group flex text-sm font-medium text-neutral-500  hover:text-neutral-900"
            >
              <FiArrowRight className="h-4 w-4 flex-shrink-0 text-neutral-500 group-hover:text-neutral-900" />
            </button>
          </div>
        </header>

        <hr className="desktop-only absolute -left-3 -right-3 mt-4 block w-full border-gray-200" />

        {/* logo icon for tablet */}
        <Link href="/simulation">
          <a className="text-center md:inline lg:hidden">
            <Logo small icon black />
          </a>
        </Link>

        <Navigation />
      </div>

      <div className="mb-2">
        <span className="hidden lg:inline">
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
              <div className="ltr:mr-4">{props.HeadingLeftIcon}</div>
            )}
            <div className="mr-4 w-full sm:block">
              {props.heading && (
                <h1 className="mb-1  font-cal text-xl font-bold capitalize tracking-wide text-black">
                  {props.heading}
                </h1>
              )}
              {props.subtitle && (
                <p className="hidden text-sm text-neutral-500 sm:block">
                  {props.subtitle}
                </p>
              )}
            </div>
            {(props.CTA || props.balance) && (
              <div
                className={classNames(
                  props.backPath
                    ? "relative"
                    : "fixed right-4 bottom-[75px] z-40 ",
                  props.CTA && "cta",
                  "mb-4 flex-shrink-0 sm:relative sm:bottom-auto sm:right-auto sm:z-0"
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
    <main className="relative z-0 flex flex-1 flex-col overflow-y-auto bg-white focus:outline-none ">
      {/* show top navigation for md and smaller (tablet and phones) */}
      {TopNavContainerProp}

      <div
        className={classNames(
          "absolute z-40 m-0 h-screen w-screen bg-black opacity-50",
          sideContainerOpen ? "" : "hidden"
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
      <nav className="fixed z-40 flex w-full items-center justify-between border-b border-gray-200 bg-gray-50 bg-opacity-50 py-1.5 px-4 backdrop-blur-lg sm:relative sm:p-4 md:hidden">
        <Link href="/simulation">
          <a>
            <Logo />
          </a>
        </Link>
        <div className="flex items-center gap-2 self-center">
          <button className="rounded-full p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2">
            <span className="sr-only">Settings</span>
            <Link href="/settings/profile">
              <a>
                <FiSettings
                  className="h-4 w-4 text-gray-700"
                  aria-hidden="true"
                />
              </a>
            </Link>
          </button>
          <UserDropdown small />
        </div>
      </nav>
    </>
  );
}
