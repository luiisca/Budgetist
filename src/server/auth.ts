import { Profile } from "next-auth";
import slugify from "~/utils/slugify";
import randomString from "~/utils/random";

const usernameSlug = (username: string) =>
    slugify(username) + "-" + randomString(6).toLowerCase();

// const budgetistAdapter = BudgetistAdapter(prisma);
// adapter: budgetistAdapter as unknown as Adapter,
export const oldAuthOptions: NextAuthOptions = {
    callbacks: {
        // async session({ session, token }) {
        //     const customSession: Session = {
        //         ...session,
        //         user: {
        //             ...session.user,
        //             id: token.id as number,
        //             name: token.name,
        //             username: token.username as string,
        //         },
        //     };
        //     return customSession;
        // },
        async signIn(params) {
            // console.log("SIGNIN CALLBACK");
            const { user, account } = params;
            const profile = params.profile as Profile & { email_verified: Date };
            // console.log("SIGNIN account", account);
            // console.log("SIGNIN user", user);
            // console.log("SIGNIN profile", profile);

            // maybe because we don't send verification email when using credentials?
            if (account?.provider === "email") {
                return true;
            }

            if (account?.type !== "oauth") {
                return false;
            }

            if (!user.email) {
                return false;
            }

            if (!user.name) {
                return false;
            }

            // if provider is anything but email
            if (account.provider) {
                let idP: IdentityProvider = IdentityProvider.GOOGLE;
                if (account.provider === "github") {
                    idP = IdentityProvider.GITHUB;
                }

                if (idP === "GOOGLE" && !profile?.email_verified) {
                    return "/auth/error?error=unverified-email";
                }
                // Only google oauth on this path
                const provider = account.provider.toUpperCase() as IdentityProvider;

                // console.log("SIGNIN CALLBACK BEFORE EXISTING USER");
                const existingUser = await prisma.user.findFirst({
                    include: {
                        accounts: {
                            where: {
                                provider: account.provider,
                            },
                        },
                    },
                    where: {
                        identityProvider: provider,
                        identityProviderId: account.providerAccountId,
                    },
                });

                // console.log("SIGNIN CALLBACK AFTER EXISTING USER", existingUser);
                if (existingUser) {
                    // console.log("EXISTING USER IN SIGNIN", existingUser);
                    // In this case there's an existing user and their email address
                    // hasn't changed since they last logged in.
                    if (existingUser.email === user.email) {
                        try {
                            // If old user without Account tries to sign in we link their google account
                            if (existingUser.accounts.length === 0) {
                                const linkAccountWithUserData = {
                                    ...account,
                                    userId: existingUser.id,
                                };
                                await budgetistAdapter.linkAccount(linkAccountWithUserData);
                            }
                        } catch (error) {
                            if (error instanceof Error) {
                                console.error(
                                    "Error while linking account of already existing user"
                                );
                            }
                        }

                        return true;
                    }

                    // If the email address doesn't match, check if an account already exists
                    // with the new email address. If it does, for now we return an error. If
                    // not, update the email of their account and log them in.
                    const userWithNewEmail = await prisma.user.findFirst({
                        where: { email: user.email },
                    });

                    if (!userWithNewEmail) {
                        await prisma.user.update({
                            where: { id: existingUser.id },
                            data: { email: user.email },
                        });
                        return true;
                    } else {
                        return "/auth/error?error=new-email-conflict";
                    }
                }

                // If there's no existing user for this identity provider and id, create
                // a new account. If an account already exists with the incoming email
                // address return an error for now.
                const existingUserWithEmail = await prisma.user.findFirst({
                    where: { email: user.email },
                });

                if (existingUserWithEmail) {
                    // if self-hosted then we can allow auto-merge of identity providers if email is verified
                    if (existingUserWithEmail.emailVerified) {
                        return true;
                    }

                    // check if user was invited
                    if (
                        !existingUserWithEmail.emailVerified &&
                        !existingUserWithEmail.username
                    ) {
                        await prisma.user.update({
                            where: { email: user.email },
                            data: {
                                // Slugify the incoming name and append a few random characters to
                                // prevent conflicts for users with the same name.
                                username: usernameSlug(user.name),
                                emailVerified: new Date(Date.now()),
                                name: user.name,
                                identityProvider: idP,
                                identityProviderId: user.id as string,
                            },
                        });

                        return true;
                    }

                    // console.log(
                    //   "SIGNIN CALLBACK, there is an existing user with this email",
                    //   existingUserWithEmail
                    // );
                    return "/auth/error?error=use-identity-login";
                }

                // console.log("SIGNIN CALLBACK: A NEW USER IS ABOUT TO BE CREATED ");
                const newUser = await prisma.user.create({
                    data: {
                        // Slugify the incoming name and append a few random characters to
                        // prevent conflicts for users with the same name.
                        username: usernameSlug(user.name),
                        emailVerified: new Date(Date.now()),
                        name: user.name,
                        email: user.email,
                        identityProvider: idP,
                        identityProviderId: user.id as string,
                    },
                });
                // console.log("SIGNIN CALLBACK: New user created", newUser);
                const linkAccountNewUserData = { ...account, userId: newUser.id };
                await budgetistAdapter.linkAccount(linkAccountNewUserData);

                return true;
            }

            return false;
        },
        // async redirect({ url, baseUrl }) {
        //   // console.log("REDIRECT CALLBACK");
        //   // console.log("REDIRECT URL + BASEURL", url, baseUrl);
        //   // Allows relative callback URLs
        //   if (url.startsWith("/")) return `${baseUrl}${url}`;
        //   // Allows callback URLs on the same domain
        //   else if (new URL(url).hostname === new URL(WEBAPP_URL as string).hostname)
        //     return url;
        //   return baseUrl;
        // },
    },
};

import { createElement } from 'react';

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
    getServerSession,
    type DefaultSession,
    type NextAuthOptions,
} from "next-auth";
import GithubProvider from "next-auth/providers/github"
import EmailProvider, { SendVerificationRequestParams } from "next-auth/providers/email";
import { createTransport } from "nodemailer"

import { renderAsync } from '@react-email/render';
import Welcome from '~/emails/welcome'

import { env } from "~/env";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";
import SMTPTransport from 'nodemailer/lib/smtp-transport';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            id: string;
            username: string;
        } & DefaultSession["user"];
    }

    // interface User {
    //   // ...other properties
    //   // role: UserRole;
    // }
}

async function sendVerificationRequest(params: SendVerificationRequestParams) {
    const { identifier, url, provider } = params
    // NOTE: You are not required to use `nodemailer`, use whatever you want.
    const transport = createTransport(provider.server as Record<string, string>)

    // "/src/utils/emails/templates/confirm-email.html" -- emal path
    const html = await renderAsync(createElement(Welcome, { url }));
    const text = await renderAsync(createElement(Welcome, { url }), {
        plainText: true
    });
    const result = await transport.sendMail({
        to: identifier,
        from: provider.from,
        subject: "Welcome to your Budgetist account",
        text,
        html,
    })
    const failed = result.rejected.concat(result.pending).filter(Boolean)
    if (failed.length) {
        throw new TRPCError({ message: `Email(s) (${failed.join(", ")}) could not be sent`, code: "INTERNAL_SERVER_ERROR" })
    }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */

const dbAdapter = PrismaAdapter(db);
export const authOptions: NextAuthOptions = {
    pages: {
        signIn: "/auth/login",
        signOut: "/auth/logout",
        error: "/auth/error", // Error code passed in query string as ?error=
        verifyRequest: "/auth/verify", // (used for check email message)
    },
    callbacks: {
        session: ({ session, user }) => {
            console.log('-------------------SESSION------------')
            console.log("SESSIOn 🤯", session)
            console.log("USER 🤯", user)
            console.log('-------------------SESSION------------')

            return {
                ...session,
                user: {
                    ...session.user,
                    id: user.id,
                }
            }
        },
        // called after oauth flow completed or before and after email provider
        async signIn({ user, account, profile, email }) {
            console.log('-------------------SIGNIN------------')
            console.log("USER 🤯", user)
            console.log("account 🤯", account)
            console.log("profile 🤯", profile)
            console.log("email (should run before and after auth flow) 🤯", email)
            console.log('-------------------SIGNIN------------')

            return true
        }
    },
    adapter: dbAdapter,
    providers: [
        GithubProvider({
            clientId: env.GITHUB_ID,
            clientSecret: env.GITHUB_SECRET,
        }),
        EmailProvider({
            maxAge: 10 * 60,
            server: {
                host: env.EMAIL_SERVER_HOST,
                port: env.EMAIL_SERVER_PORT,
                auth: {
                    user: env.EMAIL_SERVER_USER,
                    pass: env.EMAIL_SERVER_PASSWORD
                }
            },
            from: env.EMAIL_FROM,
            sendVerificationRequest
        })
        /**
         * ...add more providers here.
         *
         * Most other providers require a bit more work than the Discord provider. For example, the
         * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
         * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
         *
         * @see https://next-auth.js.org/providers/github
         */
    ],
};
/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
