'use client'

import { useState } from "react"
import { Button, ButtonProps } from "~/components/ui"

export default function SubmitBttn({ error, children, ...passthroughProps }: ButtonProps & { error?: string }) {
    const [loading, setLoading] = useState(false);

    const submitHandler = () => {
        if (!loading) {
            const form = document.querySelector('#auth-form') as HTMLFormElement | null

            if (form) {
                form.onsubmit = () => {
                    setLoading(true);
                }
            }
        }
    }

    return (
        <Button loading={loading} color="secondary" onClick={submitHandler} {...passthroughProps} >
            {children}
        </Button>
    )
}

