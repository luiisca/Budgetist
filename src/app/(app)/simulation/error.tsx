'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '~/components/ui'
import { Alert } from '~/components/ui/alert'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className='space-y-2 flex flex-col justify-center'>
            <Alert severity="error" title='Something went wrong' />
            <Button
                className='w-min'
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </Button>
        </div>
    )
}
