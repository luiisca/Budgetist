import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "~/utils/cn";

export interface AlertProps {
    title?: ReactNode;
    message?: ReactNode;
    actions?: ReactNode;
    className?: string;
    severity: "success" | "warning" | "error" | "info";
}
export function Alert(props: AlertProps) {
    const { severity } = props;

    return (
        <div
            className={cn(
                "rounded-md border p-3",
                props.className,
                severity === "error" && "border-red-900 bg-red-100 text-red-900 dark:bg-dark-destructive-100 dark:text-white",
                severity === "warning" &&
                "border-yellow-700 bg-yellow-50 text-yellow-700",
                severity === "info" && "border-sky-700 bg-sky-50 text-sky-700",
                severity === "success" && "bg-brand-500 border-transparent dark:bg-dark-accent-100 dark:border-dark-accent-200 text-white dark:text-dark-neutral"
            )}
        >
            <div className="flex">
                <div className="flex-shrink-0">
                    {severity === "error" && (
                        <AlertCircle
                            className={cn("h-5 w-5")}
                            aria-hidden="true"
                        />
                    )}
                    {severity === "warning" && (
                        <AlertTriangle
                            className={cn("h-5 w-5")}
                            aria-hidden="true"
                        />
                    )}
                    {severity === "info" && (
                        <Info
                            className={cn("h-5 w-5 text-sky-400")}
                            aria-hidden="true"
                        />
                    )}
                    {severity === "success" && (
                        <CheckCircle2
                            className={cn("h-5 w-5")}
                            aria-hidden="true"
                        />
                    )}
                </div>
                <div className="ml-3 flex-grow">
                    <h3 className="text-sm font-medium">{props.title}</h3>
                    <div className="text-sm">{props.message}</div>
                </div>
                {props.actions && <div className="text-sm">{props.actions}</div>}
            </div>
        </div>
    );
}
