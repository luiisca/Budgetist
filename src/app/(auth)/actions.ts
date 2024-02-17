'use server'

import { redirect } from "next/navigation";

export async function redirectAction({ redirectUrl }: { redirectUrl: string }) {
    redirect(redirectUrl)
}
