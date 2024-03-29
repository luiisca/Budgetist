// src/pages/_app.tsx
import "../styles/globals.css";
import "../styles/fonts.css";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { AppType, AppProps as NextAppProps } from "next/app";
import { NextRouter } from "next/router";
import { ReactNode } from "react";
import { trpc } from "../utils/trpc";
import { Toaster } from "react-hot-toast";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MetaProvider } from "components/ui/core/Meta";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { ThemeProvider } from "next-themes";

type AppProps = Omit<NextAppProps, "Component"> & {
  Component: NextAppProps["Component"] & {
    isThemeSupported?: boolean | ((arg: { router: NextRouter }) => boolean);
    getLayout?: (page: React.ReactElement, router: NextRouter) => ReactNode;
  };
  /** Will be defined only is there was an error */
  err?: Error;
};

const MyApp: AppType<{ session: Session | null }> = (props: AppProps) => {
  const { Component, pageProps, err, router } = props;
  const session = trpc.auth.getSession.useQuery().data;

  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <TooltipProvider>
      <MetaProvider>
        <SessionProvider session={session || undefined}>
          <Toaster position="bottom-right" />
          <ThemeProvider attribute="class">
            {getLayout &&
              getLayout(<Component {...pageProps} err={err} />, router)}
          </ThemeProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </SessionProvider>
      </MetaProvider>
    </TooltipProvider>
  );
};

export default trpc.withTRPC(MyApp);
