'use client'

import { useEffect, useState } from "react"
import { redirectAction } from "../actions";

export default function WaitCounter({ seconds, redirectUrl }: { seconds: string; redirectUrl: string }) {
    const [_seconds, setSeconds] = useState(Number(seconds))
    useEffect(() => {
        let sec = _seconds;
        const intervalId = setInterval(() => {
            if (sec <= 1) {
                redirectAction({ redirectUrl })
            }
            setSeconds(s => s - 1)
            sec = sec - 1
        }, 1000)

        return () => {
            console.log('interval cleared')

            clearInterval(intervalId)
        }
    }, [])

    return (
        <p>Rate limit exceeded. Try again in {_seconds} seconds.</p>
    )
}
