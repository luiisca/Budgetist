import { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
        signOut: "/logout",
        error: "/auth-error", // Error code passed in query string as ?error=
        verifyRequest: "/auth-verify", // (used for check email message)
    },
    providers: [
        // added later in auth.ts since it requires nodemailer which is only compatible with Node.js
        // while this file is also used in non-Node.js environments
    ],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            let isLoggedIn = !!auth?.user;

            function isAuthUrl() {
                const authUrls = ['/login', '/logout', '/auth-error', '/auth-verify'];
                return authUrls.some(url => nextUrl.pathname.startsWith(url));
            }

            // // users can always visit landing page
            // if (nextUrl.pathname === '/') {
            //     return true
            // }
            //
            // if (isAuthUrl()) {
            //     // users can only visit auth pages if they're not logged in
            //     if (isLoggedIn) {
            //         return Response.redirect(new URL('/simulation', nextUrl))
            //     }
            //
            //     return true
            // } else if (!isLoggedIn) {
            //     return false; // Redirect unauthenticated users to login page
            // }

            return true
        },
    },
} satisfies NextAuthConfig;

