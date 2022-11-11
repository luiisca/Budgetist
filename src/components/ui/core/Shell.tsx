import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { PropsWithChildren, useEffect } from "react";
import { Link } from "react-feather";
import useMeQuery from "server/trpc/hooks/useMeQuery";
import Logo from "../logo";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

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
  }, [loading, session]);

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
  }, [isRedirectingToOnboarding]);

  return {
    isRedirectingToOnboarding,
  };
};

export default function Shell(props: PropsWithChildren) {
  useRedirectToLoginIfUnauthenticated();
  useRedirectToOnboardingIfNeeded();

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBarContainer />
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <MainContainer {...props} />
      </div>
    </div>
  );
}

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
          <Link href="/event-types">
            <a className="px-4">
              <Logo small />
            </a>
          </Link>
          <div className="flex space-x-2">
            <button
              color="minimal"
              onClick={() => window.history.back()}
              className="group flex text-sm font-medium text-neutral-500  hover:text-neutral-900"
            >
              <FiArrowLeft className="h-4 w-4 flex-shrink-0 text-neutral-500 group-hover:text-neutral-900" />
            </button>
            <button
              color="minimal"
              onClick={() => window.history.forward()}
              className="group flex text-sm font-medium text-neutral-500  hover:text-neutral-900"
            >
              <FiArrowRight className="h-4 w-4 flex-shrink-0 text-neutral-500 group-hover:text-neutral-900" />
            </button>
          </div>
        </header>

        <hr className="absolute -left-3 -right-3 mt-4 block w-full border-gray-200" />

        {/* logo icon for tablet */}
        <Link href="/event-types">
          <a className="text-center md:inline lg:hidden">
            <Logo small icon />
          </a>
        </Link>

        <Navigation />
      </div>
    </aside>
  );
}

export default function Shell(props: PropsWithChildren) {
  useRedirectToLoginIfUnauthenticated();
  useRedirectToOnboardingIfNeeded();

  return (
    <div className="flex h-screen overflow-hidden">
      <SideBarContainer />
      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <MainContainer {...props} />
      </div>
    </div>
  );
}
