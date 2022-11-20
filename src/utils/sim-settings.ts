import clm from "country-locale-map";
import {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  MAYOR_CURRENCY_CODES,
} from "utils/constants";
import * as countryFlags from "country-flag-icons/react/3x2";
import cc from "currency-codes";
import { ProfileDataInputType } from "prisma/*";
import { z } from "zod";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export type SettingsFormValues = Omit<
  ProfileDataInputType,
  "country" | "currency"
> & {
  country?: SelectOption;
  currency?: SelectOption;
};
export const selectOptionsData = z.object({
  value: z.string().optional(),
  label: z.string().optional(),
});

export const getCurrency = (code: string) => {
  code = code || DEFAULT_CURRENCY;

  const label = new Intl.NumberFormat("en", {
    style: "currency",
    currency: code,
    maximumSignificantDigits: 1,
  })
    .format(1)
    .replace("1", " " + cc.code(code)?.currency || " ");

  return {
    value: code,
    label,
  };
};

export const getCountryLabel = (countryCode: string) => {
  countryCode = countryCode || DEFAULT_COUNTRY;

  const locale = clm.getCountryByAlpha2(countryCode)?.languages[0];
  return countryCode !== "default"
    ? new Intl.DisplayNames(locale, { type: "region" }).of(countryCode) || ""
    : "Other";
};

export const getCurrencyOptions = () => {
  const getUniqCurrencies = (currencies: string[]) => {
    const seen: Record<string, boolean> = {};
    return currencies.filter(function (currency) {
      return seen.hasOwnProperty(currency) ? false : (seen[currency] = true);
    });
  };

  return getUniqCurrencies([...MAYOR_CURRENCY_CODES, ...cc.codes()]).map(
    (code) => getCurrency(code)
  );
};

export const getCountryOptions = () => {
  const countries: SelectOption[] = [];
  for (const countryCode in countryFlags) {
    countries.push({
      value: countryCode,
      label: getCountryLabel(countryCode),
    });
  }

  return countries;
};
