'use client'

import { useFormStatus } from 'react-dom';

import { Button, ButtonProps } from "~/components/ui"

export default function SubmitBttn({ error, children, ...passthroughProps }: ButtonProps & { error?: boolean }) {
    const { pending } = useFormStatus();

    return (
        <Button
            aria-disabled={pending || error}
            disabled={error}
            loading={pending} color="secondary" {...passthroughProps}
        >
            {children}
            <span aria-live="polite" className="sr-only" role="status">
                {pending ? 'Loading' : error ? 'Disabled' : 'Submit form'}
            </span>
        </Button>
    )
}
