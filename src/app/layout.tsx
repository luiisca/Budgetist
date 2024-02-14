import "~/styles/globals.css";

import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "./_components/theme-provider";
import { cn } from "~/utils/cn";
import { Toaster } from "~/components/ui";

// import { TRPCReactProvider } from "~/trpc/react";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});


const cal = localFont({
    src: "../../public/CalSans-SemiBold.woff2",
    variable: "--font-cal"
});

export const metadata = {
    title: "Create T3 App",
    description: "Generated by create-t3-app",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactElement;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={cn('font-sans', inter.variable, cal.variable)}>
                {/* <TRPCReactProvider>{children}</TRPCReactProvider> */}
                <ThemeProvider
                    attribute="class"
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html >
    );
}
