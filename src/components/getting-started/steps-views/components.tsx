import { UseFormReturn } from "react-hook-form";
import { DEFAULT_INDEX_RETURN, DEFAULT_INVEST_PERC } from "utils/constants";
import { getCurrencyOptions, SettingsFormValues } from "utils/sim-settings";
import { NumberInput } from "components/ui";
import useUpdateInflation from "utils/hooks/useUpdateInflation";
import { CountryInflInput, CountrySelect } from "components/simulation/fields";
import { FiPercent } from "react-icons/fi";
import { ControlledSelect } from "components/ui/core/form/select/Select";

export const SimSettingsFields = ({
  form,
}: {
  form: UseFormReturn<SettingsFormValues>;
}) => {
  const { control } = form;

  const { updateInflation, isLoadingInfl, isValidInfl } =
    useUpdateInflation<SettingsFormValues>();

  return (
    <>
      {/* country */}
      <div>
        <CountrySelect<SettingsFormValues>
          form={form}
          name="country"
          control={control}
          updateCurrencyActive
          updateInflation={updateInflation}
          inflName="inflation"
        />
      </div>

      <div className="flex space-x-3">
        {/* currency */}
        <div className="flex-[1_1_80%]">
          <ControlledSelect<SettingsFormValues>
            control={control}
            options={getCurrencyOptions}
            name="currency"
            label="Currency"
          />
        </div>

        {/* country inflation */}
        <div>
          <CountryInflInput<SettingsFormValues>
            control={control}
            name="inflation"
            isLoadingInfl={isLoadingInfl}
            isValidInfl={isValidInfl}
          />
        </div>
      </div>

      {/* Investment per year perc */}
      <div>
        <NumberInput<SettingsFormValues>
          control={control}
          name="investPerc"
          label="Investment percentage"
          addOnSuffix={<FiPercent />}
          placeholder={`${DEFAULT_INVEST_PERC}`}
        />
      </div>

      {/* annual return perc */}
      <div>
        <NumberInput<SettingsFormValues>
          control={control}
          name="indexReturn"
          label="Annual return"
          addOnSuffix={<FiPercent />}
          placeholder={`${DEFAULT_INDEX_RETURN}`}
        />
      </div>
    </>
  );
};
