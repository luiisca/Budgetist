'use client'

import { api } from "~/lib/trpc/react";

export default function Name({ name }: { name?: string | null }) {
    const { data: user } = api.user.get.useQuery()

    return (
        <p className="text-sm font-medium leading-5">{user?.name || name}</p>
    )
}
