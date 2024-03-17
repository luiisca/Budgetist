'use client'
import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import {
    Control,
    DefaultValues,
    useForm,
    useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
    Button,
    Form,
    Label,
    NumberInput,
    SkeletonButton,
    SkeletonContainer,
    SkeletonText,
    TextField,
} from "~/components/ui";
import { RouterOutputs } from "~/lib/trpc/shared";
import { Alert } from "~/components/ui/alert";
import EmptyScreen from "~/components/ui/empty-screen";
import {
    catInputZod,
    CatInputType,
} from "prisma/zod-utils";
import {
    getCurrencyOptions,
} from "~/lib/sim-settings";
import {
    DEFAULT_FREQUENCY,
    CATEGORY_INFL_TYPES,
    BASIC_BAL_TYPES,
    BASIC_GROUP_TYPES,
} from "~/lib/constants";
import RecordsList from "./records-list";
import { ControlledSelect } from "~/components/ui/core/form/select/Select";
import { Dialog, DialogTrigger } from "~/components/ui/core/dialog";
import { DialogContentConfirmation } from "~/components/ui/custom-dialog";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { api } from "~/lib/trpc/react";
import TitleWithInfo from "../title-with-info";
import { CountryInflInput, CountrySelect } from "../fields";
import { BalanceContext } from "../../_lib/context";
import useUpdateInflation from "~/app/(app)/_lib/use-update-inflation";
import getDefCatInputValues from "../../_lib/get-def-cat-input-values";
import handleBalanceLoadingState from "../../_lib/handle-balance-loading-state";
import parseCatInputData from "~/app/(app)/_lib/parse-cat-input-data";
import shouldRunSim from "../../_lib/should-run-sim";

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


const CategoryForm = ({
    elKey,
    category,
    defaultValues,
    user,
    catsState,
}: {
    elKey: string;
    category?: RouterOutputs["simulation"]["categories"]["get"][0];
    defaultValues?: DefaultValues<CatInputType>;
    user: NonNullable<RouterOutputs["user"]["me"]>;
    catsState: [(React.ReactElement | null)[], React.Dispatch<React.SetStateAction<(React.ReactElement | null)[]>>]
}) => {
    const [cats, setCats] = catsState
    const utils = api.useUtils()
    // form
    const categoryForm = useForm<CatInputType>({
        resolver: zodResolver(catInputZod),
        defaultValues: defaultValues || getDefCatInputValues({ category, user }),
    });

    const { setValue, register, control } = categoryForm;

    // watch values
    const allValuesWatcher = useWatch({
        control
    })
    const [typeWatcher, freqTypeWatcher, inflTypeWatcher] = useWatch({
        control,
        name: ["type", 'freqType', 'inflType'],
    });

    // mutation
    const { dispatch: balanceDispatch, state: { years } } = useContext(BalanceContext)
    const [transactionType, setTransactionType] = useState<'update' | 'create'>(category ? 'update' : 'create')
    const categoryId = useRef(category && category.id)
    const categoryMutation = api.simulation.categories.createOrUpdate.useMutation({
        onMutate: async (input) => {
            // optimistic update
            await utils.simulation.categories.get.cancel();
            const { parsedCategory, parsedCategoryRecords } = parseCatInputData(input, user)
            const oldCachedCatsData = utils.simulation.categories.get.getData() ?? []
            if (transactionType === 'update') {
                let updatedElPosition: number = 0;
                cats.find((el, i) => {
                    if (el?.key === elKey) {
                        updatedElPosition = i

                        return el
                    }
                })
                utils.simulation.categories.get.setData(undefined, [
                    ...oldCachedCatsData.slice(0, updatedElPosition),
                    { ...parsedCategory, records: parsedCategoryRecords ?? [] },
                    ...oldCachedCatsData.slice(updatedElPosition + 1),
                ])
            } else if (transactionType === 'create') {
                utils.simulation.categories.get.setData(undefined, [...oldCachedCatsData, { ...parsedCategory, records: parsedCategoryRecords ?? [] }])
            }

            // wether run sim
            const salariesData = utils.simulation.salaries.get.getData() ?? []
            const catsData = utils.simulation.categories.get.getData()
            handleBalanceLoadingState({ shouldRunSim: shouldRunSim(catsData, salariesData), balanceDispatch, action: { type: 'ON_MUTATE' } })

            return { oldCachedCatsData, shouldRunSim }
        },
        onSuccess: (category) => {
            if (category) {
                toast.success(`Category ${transactionType === 'update' ? "updated" : "created"}`);
                categoryId.current = category.id
                setValue('id', category.id)
                setValue('recordsIdsToRemove', [])
                category.recordsIds.forEach(({ id: recordId }, index) => setValue(`records.${index}.id`, recordId))

                // update cached category id
                if (transactionType === 'create') {
                    const oldCachedCatsData = utils.simulation.salaries.get.getData() ?? []
                    if (oldCachedCatsData.length > 0) {
                        const salariesUpToLatest = oldCachedCatsData.slice(0, oldCachedCatsData.length - 1)
                        const latestSalary = oldCachedCatsData[oldCachedCatsData.length - 1]!
                        utils.simulation.salaries.get.setData(undefined, [
                            ...salariesUpToLatest,
                            {
                                ...latestSalary,
                                id: categoryId.current as bigint
                            }
                        ])
                    }
                }

                transactionType === 'create' && setTransactionType('update')
            }

            // wether run sim
            const salariesData = utils.simulation.salaries.get.getData() ?? []
            const catsData = utils.simulation.categories.get.getData()
            handleBalanceLoadingState({ shouldRunSim: shouldRunSim(catsData, salariesData), balanceDispatch, action: { type: 'ON_SUCCESS', years } })
        },
        onError: () => {
            toast.error("Could not add category. Please try again");

            // wether run sim
            const salariesData = utils.simulation.salaries.get.getData() ?? []
            const catsData = utils.simulation.categories.get.getData()
            handleBalanceLoadingState({ shouldRunSim: shouldRunSim(catsData, salariesData), balanceDispatch, action: { type: 'ON_ERROR' } })
        },
    });
    const deleteCategoryMutation = api.simulation.categories.delete.useMutation({
        onMutate: async () => {
            // optimistic update
            // UI
            let removedElPosition: number = 0;
            setCats((crrCats) => crrCats.filter((el, i) => {
                if (el?.key === elKey) {
                    removedElPosition = i
                }
                return el?.key !== elKey
            }))
            // cache
            await utils.simulation.categories.get.cancel();
            const oldCachedCatsData = utils.simulation.categories.get.getData()
            const newCatsData = [
                ...oldCachedCatsData?.slice(0, removedElPosition) ?? [],
                ...oldCachedCatsData?.slice(removedElPosition + 1) ?? []
            ]
            utils.simulation.categories.get.setData(undefined, newCatsData)

            // wether run sim
            const salariesData = utils.simulation.salaries.get.getData()
            const catsData = utils.simulation.categories.get.getData()
            handleBalanceLoadingState({ shouldRunSim: shouldRunSim(catsData, salariesData), balanceDispatch, action: { type: 'ON_MUTATE' } })

            return { oldCachedCatsData, removedElPosition }
        },
        onSuccess: () => {
            toast.success("Category deleted");

            // wether run sim
            const salariesData = utils.simulation.salaries.get.getData() ?? []
            const catsData = utils.simulation.categories.get.getData()
            handleBalanceLoadingState({ shouldRunSim: shouldRunSim(catsData, salariesData), balanceDispatch, action: { type: 'ON_SUCCESS', years } })
        },
        onError: (e, v, ctx) => {
            toast.error("Could not delete category. Please try again.");

            if (ctx) {
                // revert optimistic update
                // revert UI
                setCats((crrCats) => {
                    const key = uuidv4()
                    return [
                        ...crrCats.slice(0, ctx.removedElPosition),
                        <Fragment key={key}>
                            <CategoryForm
                                elKey={key}
                                user={user}
                                defaultValues={allValuesWatcher}
                                category={category}
                                catsState={catsState}
                            />
                        </Fragment>,
                        ...crrCats.slice(ctx.removedElPosition),
                    ]
                })

                // revert cache 
                utils.simulation.categories.get.setData(undefined, ctx.oldCachedCatsData)

                // wether run sim
                const salariesData = utils.simulation.salaries.get.getData() ?? []
                const catsData = utils.simulation.categories.get.getData()
                handleBalanceLoadingState({ shouldRunSim: shouldRunSim(catsData, salariesData), balanceDispatch, action: { type: 'ON_ERROR' } })
            }
        },
    });

    const { updateInflation, isLoadingInfl, isValidInfl } = useUpdateInflation<CatInputType>();

    return (
        <Form<CatInputType>
            form={categoryForm}
            handleSubmit={(values) => {
                categoryMutation.mutate(values)
            }}
            className="space-y-6"
        >
            {/* id */}
            <input {...register('id')} hidden />

            {/* title */}
            <div>
                <TextField label="Title" placeholder="Rent" {...register("title")} />
            </div>

            {/* type */}
            <div>
                <ControlledSelect<CatInputType>
                    control={control}
                    options={() => BASIC_BAL_TYPES}
                    name="type"
                    label="Type"
                />
            </div>

            <div className="flex space-x-3">
                {/* budget */}
                <div className="flex-[1_1_80%]">
                    <NumberInput<CatInputType>
                        control={control}
                        name="budget"
                        label="Monthly Budget"
                        placeholder="Budget"
                    />
                </div>

                {/* currency Select*/}
                <div>
                    <ControlledSelect<CatInputType>
                        control={control}
                        options={() => getCurrencyOptions({ isTypePerRec: true, countryCode: user.country })}
                        name="currency"
                        label="Currency"
                    />
                </div>
            </div>

            {typeWatcher?.value === "outcome" && (
                <>
                    <div>
                        {/* inflation label */}
                        <TitleWithInfo
                            Title={() => <Label>Inflation</Label>}
                            infoCont={
                                <>
                                    Select &quot;Per record&quot; to apply individual inflation
                                    to every expense record.
                                    <br />
                                    Leave it as is to apply same inflation to the whole
                                    category.
                                </>
                            }
                        />

                        {/* inflType select */}
                        <ControlledSelect
                            control={control as unknown as Control}
                            name="inflType"
                            options={() => CATEGORY_INFL_TYPES}
                        />
                    </div>

                    {typeWatcher?.value === "outcome" &&
                        inflTypeWatcher?.value === "perCat" && (
                            <div className="flex space-x-3">
                                {/* country Select */}
                                <div className="flex-[1_1_80%]">
                                    <CountrySelect<CatInputType>
                                        form={categoryForm}
                                        name="country"
                                        control={control}
                                        updateCurrencyActive
                                        updateInflation={updateInflation}
                                        inflName="inflVal"
                                    />
                                </div>

                                {/* country inflation */}
                                <div>
                                    <CountryInflInput<CatInputType>
                                        control={control}
                                        name="inflVal"
                                        isLoadingInfl={isLoadingInfl}
                                        isValidInfl={isValidInfl}
                                    />
                                </div>
                            </div>
                        )}
                </>
            )}
            {/* frequency type */}
            <div>
                <ControlledSelect<CatInputType>
                    control={control}
                    options={() => BASIC_GROUP_TYPES}
                    name="freqType"
                    label="Frequency Type (opt.)"
                />
            </div>
            {/* frequency */}
            {freqTypeWatcher?.value === "perCat" && (
                <div className="flex-[1_1_80%]">
                    <NumberInput<CatInputType>
                        control={control}
                        name="frequency"
                        label="Yearly Frequency"
                        placeholder={`${DEFAULT_FREQUENCY}`}
                    />
                </div>
            )}

            {/* expenses records */}
            <RecordsList
                isMutationLoading={categoryMutation.isLoading}
                user={user}
            />

            <div className="flex items-center space-x-2 pt-3">
                <Button
                    color="primary"
                    loading={categoryMutation.isLoading}
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
                            title="Delete Category"
                            description="Are you sure you want to delete the current category?"
                            Icon={AlertTriangle}
                            actionProps={{
                                actionText: "Delete category",
                                onClick: (e) => {
                                    if (e) {
                                        e.preventDefault();
                                        categoryId.current && deleteCategoryMutation.mutate({ id: categoryId.current });
                                    }
                                }
                            }}
                        />
                    </Dialog>
                ) : (
                    <Button
                        onClick={() => {
                            setCats((crrCats) => crrCats.filter((el) => el?.key !== elKey))
                        }}
                        type="button"
                        color="destructive"
                        className="border-2 px-3 font-normal"
                        StartIcon={() => <Trash2 className="m-0" />}
                    />
                )}
            </div>
        </Form>
    );
};
const Categories = () => {
    const utils = api.useUtils();
    const { isLoading: catsIsLoading, isError: catsIsError, isSuccess: catsIsSuccess, error: catsError } = api.simulation.categories.get.useQuery(undefined, {
        notifyOnChangeProps: ['error', 'isSuccess']
    });
    const { data: user, isLoading: userIsLoading, isError: userIsError, isSuccess: userIsSuccess, error: userError } = api.user.get.useQuery(undefined, {
        notifyOnChangeProps: ['error', 'isSuccess']
    });

    const [categoriesAnimationParentRef] = useAutoAnimate<HTMLDivElement>();

    const catsState = useState<(React.ReactElement | null)[]>([])
    const [cats, setCats] = catsState
    useEffect(() => {
        const catsData = utils.simulation.categories.get.getData()
        if (catsData && user) {
            const instantiatedCats = catsData.map((catData) => {
                const key = uuidv4()
                return (
                    <Fragment key={key}>
                        <CategoryForm
                            elKey={key}
                            user={user}
                            category={catData}
                            catsState={catsState}
                        />
                    </Fragment>
                )
            })
            setCats(instantiatedCats)
        }
    }, [catsIsSuccess, userIsSuccess])

    if (catsIsLoading || userIsLoading) return <SkeletonLoader />;
    if (catsIsError || userIsError)
        return (
            <Alert
                severity="error"
                title="Something went wrong"
                message={catsError?.message || userError?.message}
            />
        );

    if (catsIsSuccess && userIsSuccess) {
        return (
            <div>
                <Button
                    className="mb-4"
                    StartIcon={Plus}
                    onClick={() => {
                        const key = uuidv4()
                        user && setCats((befNewCatData) => (
                            [
                                ...befNewCatData,
                                <Fragment key={key}>
                                    <CategoryForm
                                        elKey={key}
                                        user={user}
                                        catsState={catsState}
                                    />
                                </Fragment>
                            ]
                        ))
                    }}
                >
                    New Category
                </Button>
                <div className="mb-4 space-y-12" ref={categoriesAnimationParentRef} id="cats-container">
                    {cats && cats.slice().reverse().map((cat) => cat)}
                </div>
                {/* @TODO: imprve wording */}
                {
                    cats?.length === 0 && (
                        <EmptyScreen
                            Icon={Plus}
                            headline="New category"
                            description="Budget categories helps you define all your yearly expenses to fine-tune the simulation's result"
                        />
                    )
                }
            </div >
        );
    }

    // impossible state
    return null;
};

export default Categories;
