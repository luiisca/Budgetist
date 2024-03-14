import MobileSidebars from "./_components/mobile-sidebars";
import Sidebar from "./_components/sidebar";

export default function SettingsLayout({
    children, // will be a page or nested layout
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar className="hidden lg:flex" />
            <div className="flex w-0 flex-1 flex-col overflow-hidden">
                <main className="relative z-0 flex flex-1 flex-col overflow-y-auto bg-white focus:outline-none dark:bg-dark-primary">
                    <MobileSidebars>
                        <Sidebar />
                    </MobileSidebars>

                    <div className="flex flex-col px-4 py-2 lg:px-12 lg:py-8">
                        {/* add padding to top for mobile when App Bar is fixed */}
                        <div className="flex flex-1 flex-col"> {/* <ShellMain /> */}
                            <div className="flex flex-1 [&>*]:flex-1">
                                <div className="mx-auto max-w-full justify-center md:max-w-3xl">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
