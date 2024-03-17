import { DEFAULT_COUNTRY, DEFAULT_CURRENCY, DEFAULT_INDEX_RETURN, DEFAULT_INFLATION, DEFAULT_INVEST_PERC } from "~/lib/constants";
import { getCountryOptionLabel, getCurrencyLocaleName } from "~/lib/sim-settings";
import { RouterOutputs } from "~/lib/trpc/shared";

export default function getDefSettingsProfileInputuser(user: RouterOutputs['user']['get']) {
    const country = user?.country || DEFAULT_COUNTRY;
    const currency = user?.currency || DEFAULT_CURRENCY;

    return {
        country: {
            value: country,
            label: getCountryOptionLabel(country),
        },
        currency: {
            value: currency,
            label: getCurrencyLocaleName(currency, country)
        },
        inflation: user?.inflation === 0 ? 0 : user?.inflation || DEFAULT_INFLATION,
        investPerc: user?.investPerc === 0 ? 0 : user?.investPerc || DEFAULT_INVEST_PERC,
        indexReturn: user?.indexReturn === 0 ? 0 : user?.indexReturn || DEFAULT_INDEX_RETURN,
    }
}
