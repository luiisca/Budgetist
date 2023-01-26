import clm from "country-locale-map";
import {
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  genOption,
  MAYOR_CURRENCY_CODES,
  NOT_AVAILABLE_EXCHANGE_RATES_CURRENCY_CODES,
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

export const getCurrency = (code: string, countryCode = "US") => {
  code = code || DEFAULT_CURRENCY;

  const lang = clm.getCountryByAlpha2(countryCode)?.languages[0];
  const label = new Intl.NumberFormat(lang, {
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
export const formatAmount = (value: number) => {
  let formatted = new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(value);
  if (formatted.slice(-2) === "00") {
    formatted = formatted.slice(0, -3);
  }

  return formatted as unknown as number;
};

const listAllCountries = () => {
  const countries: string[] = [];
  for (const countryCode in countryFlags) {
    countries.push(countryCode);
  }
  return countries;
};

export const getCountryLabel = (countryCode: string) => {
  countryCode = listAllCountries().includes(countryCode)
    ? countryCode
    : DEFAULT_COUNTRY;

  const lang = clm.getCountryByAlpha2(countryCode)?.languages[0];
  return countryCode !== "default"
    ? new Intl.DisplayNames(lang, { type: "region" }).of(countryCode) || ""
    : "Other";
};

export const getCurrencyOptions = (type: "perRec" | "perCat" = "perCat") => {
  const getUniqCurrencies = (currencies: string[]) => {
    const seen: Record<string, boolean> = {};
    return currencies.filter(function (currency) {
      return seen.hasOwnProperty(currency) ? false : (seen[currency] = true);
    });
  };

  const currencies = getUniqCurrencies([...MAYOR_CURRENCY_CODES, ...cc.codes()])
    .filter(
      (code) => !NOT_AVAILABLE_EXCHANGE_RATES_CURRENCY_CODES.includes(code)
    )
    .map((code) => getCurrency(code));

  if (type === "perRec") {
    return [genOption("perRec"), ...currencies];
  } else {
    return currencies;
  }
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
