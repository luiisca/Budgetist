'use client'
import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from "react";
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
    setCats,
}: {
    elKey: number;
    category?: RouterOutputs["simulation"]["categories"]["get"][0];
    defaultValues?: DefaultValues<CatInputType>;
    user: NonNullable<RouterOutputs["user"]["me"]>;
    setCats: React.Dispatch<React.SetStateAction<(React.ReactElement | null)[]>>
}) => {
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
    const onRemove = useCallback(
        () => {
            setCats((crrCats) => crrCats.filter((el) => Number(el?.key) !== elKey))
        },
        []
    )

    // mutation
    const { dispatch: balanceDispatch, state: { years } } = useContext(BalanceContext)
    const [transactionType, setTransactionType] = useState<'update' | 'create'>(category ? 'update' : 'create')
    const categoryId = useRef(category && category.id)
    const categoryMutation = api.simulation.categories.createOrUpdate.useMutation({
        onMutate: () => {
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: true,
            });
        },
        onSuccess: (id) => {
            if (id) {
                categoryId.current = id
                setValue('id', id)
            }
            toast.success(`Category ${transactionType === 'update' ? "updated" : "created"}`);
            setTransactionType('update')
            balanceDispatch({
                type: "SIM_RUN",
                years
            })
        },
        onError: async () => {
            toast.error("Could not add category. Please try again");
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: false,
            });

            onRemove()
        },
    });
    const deleteCategoryMutation = api.simulation.categories.delete.useMutation({
        onMutate: () => {
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: true,
            });

            let removedElPosition: number = 0;
            setCats((crrCats) => crrCats.filter((el, i) => {
                if (Number(el?.key) === elKey) {
                    removedElPosition = i
                }
                return Number(el?.key) !== elKey
            }))

            return removedElPosition
        },
        onSuccess: () => {
            toast.success("Category deleted");
            const catsData = utils.simulation.categories.get.getData()
            // must be length > 1 since cached data is not yet udpated here
            if (catsData && catsData.length > 1) {
                balanceDispatch({
                    type: "SIM_RUN",
                    years
                })
            }
        },
        onError: (e, v, removedElPosition) => {
            toast.error("Could not delete category. Please try again.");
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: false,
            });

            setCats((crrCats) => {
                const key = Date.now()
                return [
                    ...crrCats.slice(0, removedElPosition),
                    <Fragment key={key}>
                        <CategoryForm
                            elKey={key}
                            user={user}
                            defaultValues={allValuesWatcher}
                            category={category}
                            setCats={setCats}
                        />
                    </Fragment>,
                    ...crrCats.slice(removedElPosition),
                ]
            })
        },
    });

    const { updateInflation, isLoadingInfl, isValidInfl } = useUpdateInflation<CatInputType>();

    return (
        <Form<CatInputType>
            form={categoryForm}
            handleSubmit={(values) => { categoryMutation.mutate(values) }}
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
                                onClick: (e) =>
                                    e &&
                                    ((e: Event | React.MouseEvent<HTMLElement, MouseEvent>) => {
                                        e.preventDefault();
                                        categoryId.current && deleteCategoryMutation.mutate({ id: categoryId.current });
                                    })(e)
                            }}
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
        </Form>
    );
};
const Categories = () => {
    const utils = api.useUtils();
    const { isLoading: catsIsLoading, isError: catsIsError, isSuccess: catsIsSuccess, error: catsError } = api.simulation.categories.get.useQuery(undefined, {
        notifyOnChangeProps: ['error', 'isSuccess']
    });
    const { data: user, isLoading: userIsLoading, isError: userIsError, isSuccess: userIsSuccess, error: userError } = api.user.me.useQuery(undefined, {
        notifyOnChangeProps: ['error', 'isSuccess']
    });

    const [categoriesAnimationParentRef] = useAutoAnimate<HTMLDivElement>();

    const [newCats, setNewCats] = useState<(React.ReactElement | null)[]>([])
    const [cachedCats, setCachedCats] = useState<(React.ReactElement | null)[]>([])
    useEffect(() => {
        const catsData = utils.simulation.categories.get.getData()
        if (catsData && user) {
            const instantiatedCats = catsData.map((catData) => {
                const key = Date.now()
                return (
                    <Fragment key={key}>
                        <CategoryForm
                            elKey={key}
                            user={user}
                            category={catData}
                            setCats={setCachedCats}
                        />
                    </Fragment>
                )
            })
            setCachedCats(instantiatedCats)
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
                        const key = Date.now()
                        user && setNewCats((befNewCatData) => (
                            [
                                ...befNewCatData,
                                <Fragment key={key}>
                                    <CategoryForm
                                        elKey={key}
                                        user={user}
                                        setCats={setNewCats}
                                    />
                                </Fragment>
                            ]
                        ))
                    }}
                >
                    New Category
                </Button>
                <div className="mb-4 space-y-12" ref={categoriesAnimationParentRef} id="cats-container">
                    {newCats && newCats.slice().reverse().map((newCat) => newCat)}
                    {cachedCats && cachedCats.map((cat) => cat)}
                </div>
                {/* @TODO: imprve wording */}
                {
                    cachedCats?.length === 0 && newCats?.length === 0 && (
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
