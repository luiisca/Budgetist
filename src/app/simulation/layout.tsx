import { Toaster } from "sonner"

export default function SimulationLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div>
            <Toaster />
            {children}
        </div>
    )
}
