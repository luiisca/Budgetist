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
    ],
    adapter: PrismaAdapter(db),
    session: {
        strategy: 'jwt'
    },
    debug: true,
});

