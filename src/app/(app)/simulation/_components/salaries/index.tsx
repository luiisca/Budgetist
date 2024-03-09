'use client'

import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
    DefaultValues,
    useForm,
    useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { toast } from "sonner";
import { AlertTriangle, Percent, Plus, Trash2 } from "lucide-react";

import {
    Button,
    Form,
    NumberInput,
    SkeletonButton,
    SkeletonContainer,
    SkeletonText,
    TextField,
} from "~/components/ui";
import { Alert } from "~/components/ui/alert";
import EmptyScreen from "~/components/ui/empty-screen";
import { ControlledSelect } from "~/components/ui/core/form/select/Select";
import { Dialog, DialogTrigger } from "~/components/ui/core/dialog";
import { DialogContentConfirmation } from "~/components/ui/custom-dialog";
import {
    BASIC_GROUP_TYPES,
    DEFAULT_TAX_PERCENT,
} from "~/lib/constants";
import { getCurrencyOptions } from "~/lib/sim-settings";
import { SalInputType, salInputZod } from "prisma/zod-utils";
import { api } from "~/lib/trpc/react";
import { RouterOutputs } from "~/lib/trpc/shared";
import RecordsList from "./records-list";
import { BalanceContext } from "../../_lib/context";
import getDefSalInputValues from "../../_lib/get-def-sal-input-values";
import debounce from "~/lib/debounce";

const SkeletonLoader = () => {
    return (
        <SkeletonContainer>
            <div className="mt-6 mb-8 space-y-6">
                <SkeletonText className="h-8 w-full" />
                <div className="flex space-x-3">
                    <SkeletonText className="h-8 w-full flex-[1_1_80%]" />
                    <SkeletonText className="h-8 w-full" />
                </div>
                <SkeletonText className="h-8 w-full" />

                <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
            </div>
        </SkeletonContainer>
    );
};

const SalaryForm = ({
    elKey,
    salary,
    defaultValues,
    user,
    setSalaries,
}: {
    elKey: number;
    salary?: RouterOutputs["simulation"]["salaries"]["get"][0];
    defaultValues?: DefaultValues<SalInputType>;
    user: NonNullable<RouterOutputs['user']['me']>;
    setSalaries: React.Dispatch<React.SetStateAction<(React.ReactElement | null)[]>>
}) => {
    const utils = api.useUtils()

    // form
    const salaryForm = useForm<SalInputType>({
        resolver: zodResolver(salInputZod),
        defaultValues: defaultValues || getDefSalInputValues({ salary, user })
    });
    const { register, control, setValue, clearErrors, formState: { errors } } = salaryForm;

    // watch values
    const allValuesWatcher = useWatch({
        control
    })
    const [taxTypeWatcher, taxPercentWatcher, varianceWatcher] = useWatch({
        control,
        name: ["taxType", "taxPercent", "variance"],
    });
    const onRemove = useCallback(
        () => {
            setSalaries((crrSalaries) => crrSalaries.filter((el) => Number(el?.key) !== elKey))
        },
        []
    )

    // mutation
    const { dispatch: balanceDispatch, state: { years } } = useContext(BalanceContext)
    const [transactionType, setTransactionType] = useState<'update' | 'create'>(salary ? 'update' : 'create')
    const salaryId = useRef(salary && salary.id)
    const salaryMutation = api.simulation.salaries.createOrUpdate.useMutation({
        onMutate: () => {
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: true,
            });
        },
        onSuccess: (id) => {
            if (id) {
                salaryId.current = id
                setValue('id', id)
            }
            toast.success(`Salary ${transactionType ? "updated" : "created"}`);
            setTransactionType('update')
            balanceDispatch({
                type: "SIM_RUN",
                years
            })
        },
        onError: () => {
            toast.error("Could not add salary. Please try again");
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: false,
            });

            onRemove();
        },
    });

    // deleteMutation
    const deleteSalaryMutation = api.simulation.salaries.delete.useMutation({
        onMutate: () => {
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: true,
            });

            let removedElPosition: number = 0;
            setSalaries((crrSalaries) => crrSalaries.filter((el, i) => {
                if (Number(el?.key) === elKey) {
                    removedElPosition = i
                }
                return Number(el?.key) !== elKey
            }))

            return removedElPosition
        },
        onSuccess: async () => {
            toast.success("Salary deleted");
            const salariesData = utils.simulation.salaries.get.getData()
            // must be length > 1 since cached data is not yet udpated here
            if (salariesData && salariesData.length > 1) {
                balanceDispatch({
                    type: "SIM_RUN",
                    years,
                })
            }
        },
        onError: (e, v, removedElPosition) => {
            toast.error("Could not delete salary. Please try again.");
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: false,
            });

            setSalaries((crrSalaries) => {
                const key = Date.now()
                return [
                    ...crrSalaries.slice(0, removedElPosition),
                    <Fragment key={key}>
                        <SalaryForm
                            elKey={key}
                            user={user}
                            defaultValues={allValuesWatcher}
                            salary={salary}
                            setSalaries={setSalaries}
                        />
                    </Fragment>,
                    ...crrSalaries.slice(removedElPosition),
                ]
            })
        },
    });

    return (
        <Form<SalInputType>
            form={salaryForm}
            customInputValidation={() => {
                if (errors.variance) {
                    const fromErrorFound = errors.variance.find?.((err) => {
                        if (err?.from?.ref) {
                            err.from.ref?.focus?.()

                            return true;
                        }
                    })

                    if (fromErrorFound) {
                        return false; // stop validation
                    } else {
                        return true; // continue with handleSubmit validation
                    }
                }

                return true
            }}
            handleSubmit={(values) => {
                salaryMutation.mutate(values)
            }}
            className="space-y-6"
        >
            {/* id */}
            <input {...register('id')} hidden />

            {/* title */}
            <div>
                <TextField
                    label="Title"
                    placeholder="Salary"
                    {...register("title")}
                />
            </div>
            <div className="flex space-x-3">
                {/* amount  */}
                <div className="flex-[1_1_60%]">
                    <NumberInput<SalInputType>
                        control={control}
                        name="amount"
                        label="Yearly Salary"
                        placeholder="Current salary..."
                    />
                </div>
                {/* taxType */}
                <div>
                    <ControlledSelect<SalInputType>
                        control={control}
                        options={() => BASIC_GROUP_TYPES}
                        name="taxType"
                        label="Tax Type"
                        onChange={(option) => {
                            debounce(() => {
                                if (option.value === 'perCat') {
                                    // sets hidden empty variance taxPercent input to salary taxPercent value to avoid invisible errors on submit
                                    if (varianceWatcher && varianceWatcher.length > 0) {
                                        for (let index = 0; index < varianceWatcher.length; index++) {
                                            const period = varianceWatcher[index];
                                            if (!period?.taxPercent) {
                                                setValue(`variance.${index}.taxPercent`, taxPercentWatcher)
                                                clearErrors(`variance.${index}.taxPercent`)
                                            }
                                        }
                                    }
                                }
                                if (option.value === 'perRec') {
                                    setValue('taxPercent', 0)
                                    clearErrors('taxPercent')
                                }
                            }, 1500)()

                            return option
                        }}
                    />
                </div>
                {/* income tax */}
                {taxTypeWatcher?.value === "perCat" && (
                    <div>
                        <NumberInput<SalInputType>
                            control={control}
                            name="taxPercent"
                            label="Income Taxes"
                            addOnSuffix={<Percent />}
                            placeholder={`${DEFAULT_TAX_PERCENT}`}
                            customNumValidation
                            onChange={(parsedValue: number) => {
                                debounce(() => {
                                    if (varianceWatcher && varianceWatcher.length > 0) {
                                        for (let index = 0; index < varianceWatcher.length; index++) {
                                            const period = varianceWatcher[index];
                                            if (!period?.taxPercent) {
                                                setValue(`variance.${index}.taxPercent`, parsedValue)
                                            }
                                        }
                                    }
                                }, 1500)()

                                if (parsedValue < 0) {
                                    return 0
                                }
                                if (parsedValue > 100) {
                                    return 100
                                }
                                return parsedValue
                            }}
                        />
                    </div>
                )}
                {/* currency */}
                <div>
                    <ControlledSelect<SalInputType>
                        control={control}
                        options={() => getCurrencyOptions({ countryCode: user.country })}
                        name="currency"
                        label="Currency"
                    />
                </div>
            </div>

            <RecordsList
                isMutationLoading={salaryMutation.isLoading}
                user={user}
            />

            <div className="flex items-center space-x-2 pt-3">
                <Button
                    type="submit"
                    color="primary"
                    loading={salaryMutation.isLoading}
                >
                    {transactionType === 'update' ? "Update" : "Create"}
                </Button>
                {transactionType === 'update' ? (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                color="destructive"
                                className="border-2 px-3 font-normal"
                                StartIcon={() => <Trash2 className="m-0" />}
                            />
                        </DialogTrigger>
                        <DialogContentConfirmation
                            title="Delete Salary"
                            description="Are you sure you want to delete the current salary?"
                            actionProps={{
                                actionText: "Delete salary",
                                onClick: (e) =>
                                    e &&
                                    ((e: Event | React.MouseEvent<HTMLElement, MouseEvent>) => {
                                        e.preventDefault();
                                        salaryId.current && deleteSalaryMutation.mutate({ id: salaryId.current });
                                    })(e)
                            }}
                            Icon={AlertTriangle}
                        />
                    </Dialog>
                ) : (
                    <Button
                        onClick={onRemove}
                        type="button"
                        color="destructive"
                        className="border-2 px-3 font-normal"
                        StartIcon={() => <Trash2 className="m-0" />}
                    />
                )}
            </div>
        </Form >
    );
};

export default function Salaries() {
    const utils = api.useUtils();
    const { isLoading: salariesIsLoading, isError: salariesIsError, isSuccess: salariesIsSuccess, error: salariesError } = api.simulation.salaries.get.useQuery(undefined, {
        notifyOnChangeProps: ['error', 'isSuccess']
    });
    const { data: user, isLoading: userIsLoading, isError: userIsError, isSuccess: userIsSuccess, error: userError } = api.user.me.useQuery(undefined, {
        notifyOnChangeProps: ['error', 'isSuccess']
    });

    const [salariesAnimationParentRef] = useAutoAnimate<HTMLDivElement>();

    const [newSalaries, setNewSalaries] = useState<(React.ReactElement | null)[]>([])
    const [cachedSalaries, setCachedSalaries] = useState<(React.ReactElement | null)[]>([])
    useEffect(() => {
        const salariesData = utils.simulation.salaries.get.getData()
        if (salariesData && user) {
            const instantiatedSalaries = salariesData.map((salaryData) => {
                const key = Date.now()
                return (
                    <Fragment key={key}>
                        <SalaryForm
                            elKey={key}
                            user={user}
                            salary={salaryData}
                            setSalaries={setCachedSalaries}
                        />
                    </Fragment>
                )
            })
            setCachedSalaries(instantiatedSalaries)
        }
    }, [salariesIsSuccess, userIsSuccess])

    if (salariesIsLoading || userIsLoading) return <SkeletonLoader />;
    if (salariesIsError || userIsError)
        return (
            <Alert
                severity="error"
                title="Something went wrong"
                message={salariesError?.message || userError?.message}
            />
        );

    if (salariesIsSuccess && userIsSuccess) {
        return (
            <div>
                <Button
                    className="mb-4"
                    StartIcon={Plus}
                    onClick={() => {
                        const key = Date.now()
                        user && setNewSalaries((befNewSalData) => (
                            [
                                ...befNewSalData,
                                <Fragment key={key}>
                                    <SalaryForm
                                        elKey={key}
                                        user={user}
                                        setSalaries={setNewSalaries}
                                    />
                                </Fragment>
                            ]
                        ))
                    }}
                >
                    New Salary
                </Button>
                <div className="mb-4 space-y-12" ref={salariesAnimationParentRef}>
                    {newSalaries && newSalaries.slice().reverse().map((newCat) => newCat)}
                    {cachedSalaries && cachedSalaries.map((cat) => cat)}
                </div>
                {/* @TODO: imprve wording */}
                {cachedSalaries?.length === 0 && newSalaries?.length === 0 && (
                    <EmptyScreen
                        Icon={Plus}
                        headline="New salary"
                        description="Moonlighting? We got you covered"
                    />
                )}
            </div>
        );
    }

    // impossible state
    return null;
};
