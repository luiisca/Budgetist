import { Info } from "lucide-react";
import { Tooltip } from "~/components/ui";
import { cn } from "~/lib/cn";

export default function TitleWithInfo({
    Title,
    infoCont,
    className,
    infoIconClassName,
    tooltipSide,
}: {
    Title: React.ElementType;
    infoCont: React.ReactNode;
    className?: string;
    infoIconClassName?: string;
    tooltipSide?: "top" | "right" | "bottom" | "left";
}) {
    return (
        <div className={cn("flex items-center space-x-1 ", className)}>
            <Title className="mb-0" />
            <Tooltip
                content={<p className="text-center">{infoCont}</p>}
                side={tooltipSide}
            >
                <div className="-ml-1 self-center rounded-md p-2 hover:bg-gray-200 dark:hover:bg-dark-400 dark:hover:ring-1 dark:hover:ring-dark-500">
                    <Info className={cn("h-3 w-3", infoIconClassName)} />
                </div>
            </Tooltip>
        </div >
    );
};
