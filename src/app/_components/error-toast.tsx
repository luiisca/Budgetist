'use client'

import { useEffect } from "react"
import { toast } from "sonner"

export default function ErrorToast({ error }: { error: string }) {
    useEffect(() => {
        function onTimeout() {
            toast('test')
        }

        const timeoutId = setTimeout(onTimeout, 100);

        return () => {
            console.log('🟡 Cancel ');
            clearTimeout(timeoutId);
        };
    }, [])

    return <p>idk</p>
}
