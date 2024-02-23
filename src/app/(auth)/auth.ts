import { createElement } from 'react';
import NextAuth from 'next-auth';
import Nodemailer, { NodemailerConfig } from 'next-auth/providers/nodemailer';
import Github from 'next-auth/providers/github'
import { createTransport } from 'nodemailer';
import { renderAsync } from '@react-email/render';
import { PrismaAdapter } from '@auth/prisma-adapter'

import { env } from '~/env';
import Welcome from '~/emails/welcome'
import { authConfig } from './auth.config';
import { db } from '~/server/db';
import slugify from '~/lib/slugify';
import { randomString } from '~/lib/random';
import omit from '~/lib/omit';
import pick from '~/lib/pick';
import { AccountModel } from '../../../prisma/zod/account'

const usernameSlug = (username: string) => `${slugify(username)}-${randomString(6).toLowerCase()}`;

async function sendVerificationRequest(params: Parameters<NodemailerConfig["sendVerificationRequest"]>[number]) {
    const { identifier, url, provider } = params
    const transport = createTransport(provider.server as Record<string, string>)

    const result = await transport.sendMail({
        to: identifier,
        from: provider.from,
        subject: "Welcome to your Budgetist account",
        text: await renderAsync(createElement(Welcome, { url }), {
            plainText: true
        }),
        html: await renderAsync(createElement(Welcome, { url })),
    })
    const failed = result.rejected.concat(result.pending).filter(Boolean)
    if (failed.length) {
        throw new Error(`Email (${failed.join(", ")}) could not be sent`)
    }
}

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    providers: [
        Github({
            allowDangerousEmailAccountLinking: true,
        }),
        Nodemailer({
            maxAge: 10 * 60,
            server: {
                service: env.EMAIL_SERVER_SERVICE,
                host: env.EMAIL_SERVER_HOST,
                secure: false,
                auth: {
                    user: env.EMAIL_SERVER_USER,
                    pass: env.EMAIL_SERVER_PASSWORD
                }
            },
            from: env.EMAIL_FROM,
            sendVerificationRequest
        })
    ],
    callbacks: {
        async signIn(params) {
            const { account: providerAccount, user: providerUser } = params

            if (!providerUser.email) {
                return false;
            }

            const dbUserWithEmail = await db.user.findUnique({
                where: {
                    email: providerUser.email
                }
            })

            // if user signs in with nodemailer and has clicked verification link url sent to their inbox
            if (providerAccount?.provider == 'nodemailer' && !params.email?.verificationRequest) {

                if (dbUserWithEmail) {
                    return true
                }

                if (!dbUserWithEmail) {
                    const name = providerUser.email.split('@')[0] as string
                    // no user exists, create it
                    await db.user.create({
                        data: {
                            name,
                            username: usernameSlug(name),
                            email: providerUser.email,
                            emailVerified: new Date(Date.now())
                        }
                    })
                }

                return true
            }
            if (providerAccount?.provider == 'github') {
                // is there a user with account with account.provider and account.providerId
                const dbUserWithAccount = await db.user.findFirst({
                    where: {
                        accounts: {
                            some: {
                                provider: providerAccount?.provider,
                                providerAccountId: providerAccount?.providerAccountId
                            }
                        }
                    }
                })
                if (dbUserWithAccount) {
                    if (dbUserWithAccount?.email === providerUser.email) {
                        return true
                    }

                    if (dbUserWithAccount?.email !== providerUser.email) {
                        const dbUserWithNewEmail = dbUserWithEmail

                        if (dbUserWithNewEmail) {
                            return "/auth-error?error=new-email-conflict";
                        }
                        if (!dbUserWithNewEmail) {
                            // update dbUserWithAccount.email since new email hasn't been registered with another user
                            await db.user.update({
                                where: {
                                    id: dbUserWithAccount.id
                                },
                                data: {
                                    email: providerUser.email
                                }
                            })
                        }
                    }
                }
                if (!dbUserWithAccount) {
                    if (dbUserWithEmail) {
                        // login in with github provider after signing up with nodemailer
                        // will create a new account and link it with existing user
                        if (!providerAccount) {
                            return false
                        }

                        const omittedAccountShape = omit(AccountModel.shape, ['id', 'userId'])
                        const keysToPick = Object.keys(omittedAccountShape) as Array<keyof typeof omittedAccountShape>
                        const pickedProviderAccount = pick(providerAccount, keysToPick)

                        // update user with name, username and image coming from providerAccount, 
                        // only if user hasn't completed the onboarding process to avoid overriding their preferences
                        if (!dbUserWithEmail.completedOnboarding) {
                            await db.user.update({
                                where: {
                                    id: dbUserWithEmail.id
                                },
                                data: {
                                    name: providerUser.name,
                                    username: usernameSlug(providerUser.name as string),
                                    image: providerUser.image
                                }
                            })
                        }
                        await db.account.create({
                            data: {
                                ...pickedProviderAccount,
                                userId: dbUserWithEmail.id,
                            }
                        })
                    }
                    if (!dbUserWithEmail) {
                        // no user at all, create new one and new account
                        if (!providerUser.name) {
                            return false
                        }

                        const newUser = await db.user.create({
                            select: {
                                id: true,
                            },
                            data: {
                                name: providerUser.name,
                                username: usernameSlug(providerUser.name as string),
                                email: providerUser.email,
                                image: providerUser.image,
                            }
                        })

                        // no account, create new one and link it to just created user
                        if (!providerAccount) {
                            return false
                        }

                        // ensures we only store providerAccount fields the db expects
                        const omittedAccountShape = omit(AccountModel.shape, ['id', 'userId'])
                        const keysToPick = Object.keys(omittedAccountShape) as Array<keyof typeof omittedAccountShape>
                        const pickedProviderAccount = pick(providerAccount, keysToPick)

                        const newAccount = await db.account.create({
                            data: {
                                ...pickedProviderAccount,
                                userId: newUser.id
                            }
                        })
                    }
                }

                return true
            }

            return true
        },
    },
    adapter: PrismaAdapter(db),
    session: {
        strategy: 'jwt'
    },
    debug: true,
});

