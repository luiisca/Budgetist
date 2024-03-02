'use client'

import { useCallback, useState } from "react";
import { FieldValues, Path, PathValue, UseFormReturn } from "react-hook-form";
import { SingleValue } from "react-select";
import { toast } from "sonner";
import { SelectOption } from "~/lib/sim-settings";
import { api } from "~/lib/trpc/react";

const useUpdateInflation = <T extends FieldValues>() => {
    const [isLoadingInfl, setIsLoadingInfl] = useState<boolean | null>(null);
    const [isValidInfl, setIsValidInfl] = useState<boolean | null>(null);
    const utils = api.useUtils();

    const updateInflation = useCallback(
        async (
            countryData: SingleValue<SelectOption>,
            form: UseFormReturn<T>,
            inflName: string
        ) => {
            if (countryData) {
                const countryName = countryData.value;

                // start request
                setIsValidInfl(null);
                setIsLoadingInfl(true);
                const inflation = await utils.external.inflation.fetch(
                    new Intl.DisplayNames("en", { type: "region" }).of(countryName) || ""
                );
                setIsLoadingInfl(false);

                // handle result
                if (!inflation || inflation.length === 0) {
                    setIsValidInfl(false);
                    setTimeout(() => setIsValidInfl(null), 2000);
                    toast.warning(`Could not find inflation for ${countryData.label}`);

                    return;
                } else {
                    setIsValidInfl(true);
                    setTimeout(() => setIsValidInfl(null), 2000);

                    const yearlyRatePct = Number(inflation[0]?.yearly_rate_pct)
                    return form.setValue(
                        inflName as Path<T>,
                        Math.round(yearlyRatePct) as PathValue<T, Path<T>>,
                        {
                            shouldDirty: true,
                        }
                    );
                }

            }
        },
        [utils.external.inflation]
    );

    return { updateInflation, isLoadingInfl, isValidInfl };
};
export default useUpdateInflation;
