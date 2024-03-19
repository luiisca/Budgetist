import {
    CatInputType, OptCatInputType,
} from "prisma/zod-utils";
import { Category, Record, User } from "@prisma/client";
import { DEFAULT_FREQUENCY } from "~/lib/constants";
import omit from "~/lib/omit";

export default function parseCatInputData(category: CatInputType, user: User) {
    const records = category.records;

    const optFields: Required<Omit<OptCatInputType, 'id'>> = {
        inflVal: category.inflVal || user.inflation,
        icon: category.icon || "Icon",
        frequency: category.frequency || DEFAULT_FREQUENCY,
    }
    const parsedCategory: Omit<Category, 'id' | 'userId'> = {
        ...(omit(category, 'records', 'recordsIdsToRemove')),
        ...optFields,
        currency: category.currency.value,
        type: category.type.value,
        inflType: category.inflType.value,
        country: category.country.value,
        freqType: category.freqType.value,
    }
    const parsedCategoryRecords: (Omit<Record, 'id' | 'categoryId'> & { id?: bigint })[] | undefined = records?.map((record) => ({
        ...record,
        title: record.title || "",
        frequency: record.frequency || DEFAULT_FREQUENCY,
        country: record.country.value,
        type: record.type.value,
        inflation: record.inflation || user.inflation,
        currency: record.currency?.value || user.currency,
    }));

    return { parsedCategory, parsedCategoryRecords }
}
