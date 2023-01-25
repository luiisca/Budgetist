import classNames from "classnames";
import { LOGO_ICON, LOGO } from "utils/constants";

export default function Logo({
  small,
  icon,
}: {
  small?: boolean;
  icon?: boolean;
}) {
  return (
    <h1 className="inline">
      <strong>
        {icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="mx-auto w-8 dark:invert"
            alt="Budgetist"
            title="Budgetist"
            src={LOGO_ICON}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={classNames(
              small ? "h-4 w-auto" : "h-6 w-auto",
              "dark:invert"
            )}
            alt="Budgetist"
            title="Budgetist"
            src={LOGO}
          />
        )}
      </strong>
    </h1>
  );
}
