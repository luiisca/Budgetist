import { TitleWithInfo } from "components/simulation/components";
import { Badge } from "./Badge";

export function ListItem({
  category,
  infoBubble,
}: {
  infoBubble?: React.ReactNode;
  category: {
    icon?: string;
    title: string | null;
    parentTitle?: string;
    type: string;
    inflation?: number;
    frequency?: number;
    spent: number;
    record?: boolean;
  };
}): JSX.Element {
  return (
    <li>
      <div className="flex items-center justify-between py-5 hover:bg-neutral-50 ltr:pl-4 rtl:pr-4 sm:ltr:pl-0 sm:rtl:pr-0">
        <div className="group flex w-full items-center justify-between hover:bg-neutral-50 sm:px-6">
          <div className="flex-grow truncate text-sm">
            <div className="space-x-2">
              <span className="truncate font-medium text-neutral-900">
                {category.title}
              </span>
              <Badge
                variant={
                  category.type === "income" || category.type === "salary"
                    ? "green"
                    : "red"
                }
                className="text-xs"
              >
                {category.type}
              </Badge>
            </div>
            {category.record && (
              <p className="mt-1 text-xs text-neutral-500">
                {category.parentTitle}
              </p>
            )}
          </div>
        </div>
        {infoBubble ? (
          <TitleWithInfo
            Title={() => (
              <p className="mx-1 mr-5 text-lg font-medium text-neutral-900">
                {category.spent}
              </p>
            )}
            infoCont={
              <div className="grid grid-cols-2 justify-items-start gap-x-2">
                {infoBubble}
              </div>
            }
            className="flex-row-reverse"
          />
        ) : (
          <p className="mx-1 mr-5 text-lg font-medium text-neutral-900">
            {category.spent}
          </p>
        )}
      </div>
    </li>
  );
}
