export const WEBAPP_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
export const LOGO = "/logo.png";
export const LOGO_ICON = "/icon.png";

export const FLAG_URL =
  "http://purecatamphetamine.github.io/country-flag-icons/3x2/{XX}.svg";

export const MAYOR_CURRENCY_CODES = [
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CHF",
  "AUD",
  "CAD",
  "CNY",
  "NZD",
  "INR",
  "BZR",
  "SEK",
  "ZAR",
  "HKD",
  "PEN",
  "MXN",
  "CLP",
];
export const NOT_AVAILABLE_EXCHANGE_RATES_CURRENCY_CODES = [
  "CHW",
  "CLF",
  "CUC",
  "CHE",
  "KPW",
  "MXV",
  "UYI",
  "XBD",
  "XPD",
  "SVC",
  "XBA",
  "XUA",
  "XBB",
  "XSU",
  "XTS",
  "XAG",
  "XPT",
  "XXX",
  "XBC",
  "UYW",
  "XAU",
  "USN",
  "COU",
  "BOV",
];

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_COUNTRY = "US";
export const DEFAULT_INVEST_PERC = 60;
export const DEFAULT_INFLATION = 7;
export const DEFAULT_INDEX_RETURN = 7;
export const DEFAULT_FREQUENCY = 12;
export const DEFAULT_TAX_PERCENT = 30;

export const MIN_YEARS = 1;
export const MAX_YEARS = 200;

export const PER_CAT_VAL = "perCat";
export const PER_CAT_LABEL = "Per Category";
export const PER_REC_VAL = "perRec";
export const PER_REC_LABEL = "Per Record";
export const INCOME_VAL = "income";
export const INCOME_LABEL = "Income";
export const OUTCOME_VAL = "outcome";
export const OUTCOME_LABEL = "Outcome";
export const DISABLED_VAL = "";
export const DISABLED_LABEL = "Disabled";

export type OptionsType =
  | "income"
  | "outcome"
  | "perRec"
  | "perCat"
  | "disabled";
export const getLabel = (type: OptionsType) =>
  type === "income"
    ? INCOME_LABEL
    : type === "outcome"
    ? OUTCOME_LABEL
    : type === "perRec"
    ? PER_REC_LABEL
    : type === "perCat"
    ? PER_CAT_LABEL
    : DISABLED_LABEL;

export const genOption = (type: OptionsType) => {
  const getPropVal = (prop: "value" | "label") =>
    type === "income"
      ? prop === "value"
        ? INCOME_VAL
        : INCOME_LABEL
      : type === "outcome"
      ? prop === "value"
        ? OUTCOME_VAL
        : OUTCOME_LABEL
      : type === "perRec"
      ? prop === "value"
        ? PER_REC_VAL
        : PER_REC_LABEL
      : type === "perCat"
      ? prop === "value"
        ? PER_CAT_VAL
        : PER_CAT_LABEL
      : prop === "value"
      ? DISABLED_VAL
      : DISABLED_LABEL;

  return {
    value: getPropVal("value"),
    label: getPropVal("label"),
  };
};

export const BASIC_BAL_TYPES = [genOption("income"), genOption("outcome")];
export const BASIC_GROUP_TYPES = [genOption("perCat"), genOption("perRec")];

export const CATEGORY_INFL_TYPES = [
  genOption("disabled"),
  ...BASIC_GROUP_TYPES,
];
