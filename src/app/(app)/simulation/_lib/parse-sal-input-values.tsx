import { SalInputType, } from "prisma/zod-utils";
import { Salary } from "@prisma/client";
import omit from "~/lib/omit";

export default function parseSalaryInputData(salary: SalInputType) {
    const variance = salary.variance;

    const parsedSalary: Omit<Salary, 'userId'> = {
        ...(omit(salary, 'variance', 'periodsIdsToRemove')),
        id: salary.id as bigint,
        title: salary.title || 'Job',
        currency: salary.currency.value,
        taxType: salary.taxType.value,
    }

    return { parsedSalary, variance }
}
