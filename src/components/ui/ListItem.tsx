import { Badge } from "./Badge";

export function ListItem({
  category,
}: {
  category: {
    icon?: string;
    title: string | null;
    parentTitle?: string;
    type: string;
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
                variant={category.type === "income" ? "green" : "red"}
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
        <p className="mr-5 text-lg font-medium text-neutral-900">
          {category.spent}
        </p>
        {/* dropdwn for seeing balance of selected category at specified year */}
      </div>
    </li>
  );
}
