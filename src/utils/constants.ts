export const WEBAPP_URL = process.env.NEXT_PUBLIC_VERCEL_URL;
export const LOGO = "/logo.png";
export const LOGO_ICON = "/icon.png";

export const FLAG_URL =
  "http://purecatamphetamine.github.io/country-flag-icons/3x2/{XX}.svg";

export const INFLATION_API_END =
  "https://api.api-ninjas.com/v1/inflation?country=";
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

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_COUNTRY = "US";
export const DEFAULT_INVEST_PERC = 60;
export const DEFAULT_INFLATION = 7;
export const DEFAULT_INDEX_RETURN = 7;

export const MIN_YEARS = 1;
export const MAX_YEARS = 200;
export const DEFAULT_FREQUENCY = 12;
export const DEFAULT_FREQUENCY_TYPE = "perCat";
export const CATEGORY_TYPES = ["income", "outcome", "perRec"];
export const CATEGORY_INFL_TYPES = ["", "perCat", "perRec"];
