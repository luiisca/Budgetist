'use client'

import { useContext } from "react";
import { useForm } from "react-hook-form";

import { BalanceContext } from "../_lib/context";
import { MAX_YEARS, MIN_YEARS } from "~/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form, NumberInput, transIntoInt } from "~/components/ui";
import { RunSimInputType, runSimInputZod } from "prisma/zod-utils";
import debounce from "~/lib/debounce";

export default function RunSimForm() {
    const {
        state: { totalBalanceLoading },
        dispatch: balanceDispatch,
    } = useContext(BalanceContext);

    const runSimForm = useForm<RunSimInputType>({
        resolver: zodResolver(runSimInputZod),
        defaultValues: {
            years: MIN_YEARS,
        },
    });
    const { control } = runSimForm;


    return (
        <Form
            form={runSimForm}
            handleSubmit={(values: RunSimInputType) => {
                console.log("run-sim for run!")
                balanceDispatch({
                    type: "TOTAL_BAL_LOADING",
                    totalBalanceLoading: true
                })
                balanceDispatch({
                    type: "YEARS_UPDATED",
                    years: Number(values.years),
                });
                balanceDispatch({
                    type: "SIM_RUN",
                    years: Number(values.years),
                });
            }}
            className="my-6 flex justify-start"
        >
            <NumberInput
                label="Years"
                control={control}
                name="years"
                className="mb-0 w-auto rounded-r-none"
                onChange={(parsedValue: number) => {
                    if (parsedValue > MAX_YEARS) return MAX_YEARS;

                    balanceDispatch({
                        type: "TOTAL_BAL_LOADING",
                        totalBalanceLoading: true
                    })
                    debounce(() => {
                        balanceDispatch({
                            type: "YEARS_UPDATED",
                            years: Number(parsedValue),
                        });
                        balanceDispatch({
                            type: "SIM_RUN",
                            years: Number(parsedValue),
                        });
                    }, 1500)()

                    return parsedValue;
                }}
            />
            <Button type='submit' disabled={!!runSimForm.formState.errors.years} loading={totalBalanceLoading} type="submit" className="self-end rounded-l-none px-4 py-2">
                Run
            </Button>
        </Form>
    );
};
