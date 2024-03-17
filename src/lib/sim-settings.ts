import clm from "country-locale-map";
import {
    DEFAULT_COUNTRY,
    MAYOR_CURRENCY_CODES,
    getSelectOption,
} from "~/lib/constants";
import * as countryFlags from "country-flag-icons/react/3x2";
import cc from "currency-codes";
import { z } from "zod";
import { Currencies } from "country-to-currency";

export interface SelectOption {
    readonly value: string;
    readonly label: string;
}

export const selectOptionsData = z.object({
    value: z.string().optional(),
    label: z.string().optional(),
});

export const getCurrencyLocaleName = (code: Currencies, countryCode = DEFAULT_COUNTRY) => {
    const lang = clm.getCountryByAlpha2(countryCode)?.languages[0];
    return new Intl.NumberFormat(lang, {
        style: "currency",
        currency: code,
        maximumSignificantDigits: 1,
    })
        .format(1)
        .replace("1", " " + cc.code(code)?.currency || " ");
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

const allCountriesWithFlags: string[] = []
const listAllCountriesWithFlag = () => {
    if (allCountriesWithFlags.length === 0) {
        for (const countryCode in countryFlags) {
            allCountriesWithFlags.push(countryCode);
        }
    }

    return allCountriesWithFlags;
};

export const getCountryOptionLabel = (countryCode: string) => {
    countryCode = (listAllCountriesWithFlag().includes(countryCode) && countryCode) || DEFAULT_COUNTRY;

    const lang = clm.getCountryByAlpha2(countryCode)?.languages[0];

    return countryCode !== "default"
        ? new Intl.DisplayNames(lang, { type: "region" }).of(countryCode) || ""
        : "Other";
};

// export const getCurrencyOptions = ({ isTypePerRec = false, countryCode = DEFAULT_COUNTRY }: { isTypePerRec?: boolean, countryCode: string } | undefined) => {
export const getCurrencyOptions = ({ isTypePerRec = false, countryCode = DEFAULT_COUNTRY }: { isTypePerRec?: boolean; countryCode?: string }) => {
    const getUniqCurrencies = (currencies: string[]) => {
        const seen: Record<string, boolean> = {};
        return currencies.filter(function(currency) {
            return seen.hasOwnProperty(currency) ? false : (seen[currency] = true);
        });
    };

    const currencies = getUniqCurrencies([
        ...MAYOR_CURRENCY_CODES,
        ...cc.codes(),
    ]).map((code) => ({
        value: code,
        label: getCurrencyLocaleName(code, countryCode)
    }));

    if (isTypePerRec) {
        return [getSelectOption("perRec"), ...currencies];
    } else {
        return currencies;
    }
};

export const getCountryOptions = () => {
    const countries: SelectOption[] = [];
    for (const countryCode in countryFlags) {
        countries.push({
            value: countryCode,
            label: getCountryOptionLabel(countryCode),
        });
    }

    return countries;
};
