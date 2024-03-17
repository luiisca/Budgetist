import { RouterOutputs } from "~/lib/trpc/shared";

export default function shouldRunSim(catsData: RouterOutputs['simulation']['categories']['get'] | undefined, salariesData: RouterOutputs['simulation']['salaries']['get'] | undefined) {
    const catsDataIsValidAndNotEmpty = catsData && catsData.length > 0
    const salariesDataIsValidAndNotEmpty = salariesData && salariesData.length > 0

    return catsDataIsValidAndNotEmpty && salariesDataIsValidAndNotEmpty
}
