import clm from "country-locale-map";
import { MAYOR_CURRENCY_CODES } from "utils/constants";
import * as countryFlags from "country-flag-icons/react/3x2";
import cc from "currency-codes";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export const getCurrency = (code: string) => {
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
  const locale = clm.getCountryByAlpha2(countryCode)?.languages[0];
  return countryCode !== "default"
    ? new Intl.DisplayNames(locale, { type: "region" }).of(countryCode) || ""
    : "Other";
};

export const getCurrencyOptions = () => {
  const getUniqCurrencies = (currencies: string[]) => {
    let seen: Record<string, boolean> = {};
    return currencies.filter(function (currency) {
      return seen.hasOwnProperty(currency) ? false : (seen[currency] = true);
    });
  };

  return getUniqCurrencies([...MAYOR_CURRENCY_CODES, ...cc.codes()]).map(
    (code) => getCurrency(code)
  );
};

export const getCountryOptions = () => {
  let countries: SelectOption[] = [];
  for (const countryCode in countryFlags) {
    countries.push({
      value: countryCode,
      label: getCountryLabel(countryCode),
    });
  }

  return countries;
};
