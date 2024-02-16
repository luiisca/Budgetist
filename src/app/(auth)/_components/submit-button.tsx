'use client'

import { useFormStatus } from 'react-dom';

import { Button, ButtonProps } from "~/components/ui"

export default function SubmitBttn({ error, children, ...passthroughProps }: ButtonProps & { error?: string }) {
    const { pending } = useFormStatus();

    return (
        <Button
            aria-disabled={pending}
            loading={pending} color="secondary" {...passthroughProps}
        >
            {children}
            <span aria-live="polite" className="sr-only" role="status">
                {pending ? 'Loading' : 'Submit form'}
            </span>
        </Button>
    )
}
