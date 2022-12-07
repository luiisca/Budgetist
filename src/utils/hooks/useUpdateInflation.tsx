import showToast from "components/ui/core/notifications";
import { useCallback, useState } from "react";
import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";
import { SingleValue } from "react-select";
import { SelectOption } from "utils/sim-settings";
import { trpc } from "utils/trpc";

const updateInflation = <T extends FieldValues>({
  inflName,
}: {
  inflName: string;
}) => {
  const [isLoadingInfl, setIsLoadingInfl] = useState<boolean | null>(null);
  const [isValidInfl, setIsValidInfl] = useState<boolean | null>(null);
  const utils = trpc.useContext();

  const updateInflation = useCallback(
    async (countryData: SingleValue<SelectOption>, form: UseFormReturn<T>) => {
      let inflation = [];
      if (countryData) {
        const countryName = countryData.value;

        setIsValidInfl(null);
        setIsLoadingInfl(true);

        inflation = await utils.external.inflation.fetch(
          new Intl.DisplayNames("en", { type: "region" }).of(countryName) || ""
        );
        setIsLoadingInfl(false);

        if (!inflation || inflation.length === 0) {
          setIsValidInfl(false);
          setTimeout(() => setIsValidInfl(null), 2000);
          showToast(
            "Something went wrong updating inflation. Please try again or update manually",
            "warning"
          );
          return;
        }
        setIsValidInfl(true);
        setTimeout(() => setIsValidInfl(null), 2000);

        form.setValue(
          inflName as Path<T>,
          Math.round(+inflation[0].yearly_rate_pct) as PathValue<T, Path<T>>,
          {
            shouldDirty: true,
          }
        );
      }
    },
    []
  );

  return { updateInflation, isLoadingInfl, isValidInfl };
};
export default updateInflation;
