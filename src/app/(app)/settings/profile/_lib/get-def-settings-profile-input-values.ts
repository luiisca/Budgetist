import { DEFAULT_COUNTRY, DEFAULT_CURRENCY } from "~/lib/constants";
import { getCountryOptionLabel, getCurrencyLocaleName } from "~/lib/sim-settings";
import { RouterOutputs } from "~/lib/trpc/shared";

export default function getDefSettingsProfileInputValues(user: RouterOutputs['user']['get']) {
    const country = user?.country || DEFAULT_COUNTRY;
    const currency = user?.currency || DEFAULT_CURRENCY;

    return {
        name: user?.name as string,
        image: user?.image as string,
        country: {
            value: country,
            label: getCountryOptionLabel(country),
        },
        currency: {
            value: currency,
            label: getCurrencyLocaleName(currency, country)
        },
    }
}
