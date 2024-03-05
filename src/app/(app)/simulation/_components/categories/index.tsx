'use client'
import React, { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from 'react-dom';
import {
    Control,
    useForm,
    useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Plus, Trash2, X } from "lucide-react";
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
    DEFAULT_CURRENCY,
    DEFAULT_COUNTRY,
    CATEGORY_INFL_TYPES,
    SELECT_PER_CAT_VAL,
    SELECT_PER_CAT_LABEL,
    SELECT_OUTCOME_VAL,
    SELECT_OUTCOME_LABEL,
    SELECT_INCOME_VAL,
    SELECT_INCOME_LABEL,
    OptionsType,
    BASIC_BAL_TYPES,
    BASIC_GROUP_TYPES,
    SELECT_LABELS_MAP,
    getSelectOptionWithFallback,
    SELECT_PER_REC_VAL,
    getSelectOption,
} from "~/lib/constants";
import RecordsList from "./records-list";
import { ControlledSelect } from "~/components/ui/core/form/select/Select";
import Switch from "~/components/ui/core/switch";
import { Dialog, DialogTrigger } from "~/components/ui/core/dialog";
import { DialogContentConfirmation } from "~/components/ui/custom-dialog";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { api } from "~/lib/trpc/react";
import TitleWithInfo from "../title-with-info";
import { CountryInflInput, CountrySelect } from "../fields";
import omit from "~/lib/omit"
import { BalanceContext } from "../../_lib/context";
import useUpdateInflation from "~/app/(app)/_lib/use-update-inflation";
import getDefCatInputValues from "../../_lib/get-def-cat-input-values";
import { randomString } from "~/lib/random";

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
    onRemove,
    category,
}: {
    onRemove?: () => void;
    category?: RouterOutputs["simulation"]["categories"]["get"][0];
}) => {
    const utils = api.useUtils()
    // form
    const categoryForm = useForm<CatInputType>({
        resolver: zodResolver(catInputZod),
        // reValidateMode: "onChange",
        defaultValues: getDefCatInputValues(category),
    });

    const { reset, setValue, register, control } = categoryForm;
    const [typeWatcher, freqTypeWatcher, inflTypeWatcher] = useWatch({
        control,
        name: ["type", 'freqType', 'inflType'],
    });

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
            onRemove && onRemove();
        },
    });
    const deleteCategoryMutation = api.simulation.categories.delete.useMutation({
        onMutate: () => {
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: true,
            });
        },
        onSuccess: async () => {
            toast.success("Category deleted");
            const catsData = utils.simulation.categories.get.getData()
            // must be length > 1 since cached data is not yet udpated here
            if (catsData && catsData.length > 1) {
                balanceDispatch({
                    type: "SIM_RUN",
                    years
                })
            }
            onRemove && onRemove();
        },
        onError: async () => {
            toast.error("Could not delete category. Please try again.");
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: false,
            });
        },
    });

    const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
    const { updateInflation, isLoadingInfl, isValidInfl } = useUpdateInflation<CatInputType>();
    const { data: user, isLoading, isError, isSuccess, error } = api.user.me.useQuery();

    if (isLoading || !user) return <SkeletonLoader />;

    if (isError) {
        return (
            <Alert
                severity="error"
                title="Something went wrong"
                message={error?.message}
            />
        );
    }

    if (isSuccess) {
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
                            options={() => getCurrencyOptions({ type: "perRec", countryCode: user.country })}
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
                        disabled={categoryMutation.isLoading}
                    >
                        {transactionType === 'update' ? "Update" : "Create"}
                    </Button>
                    {transactionType === 'update' ? (
                        <Dialog
                            open={deleteCategoryOpen}
                            onOpenChange={setDeleteCategoryOpen}
                        >
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
                            onClick={() => {
                                onRemove && onRemove();
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
    }

    // impossible state
    return null;
};
const Categories = () => {
    const utils = api.useUtils();
    const categoriesRes = api.simulation.categories.get.useQuery(undefined, {
        notifyOnChangeProps: ['error', 'isSuccess']
    });
    const {
        isLoading,
        isError,
        isSuccess,
        error,
    } = categoriesRes

    const [categoriesAnimationParentRef] = useAutoAnimate<HTMLDivElement>();

    const [newCats, setNewCats] = useState<(React.ReactElement | null)[]>([])
    const [cachedCats, setCachedCats] = useState<(React.ReactElement | null)[]>([])
    useEffect(() => {
        const catsData = utils.simulation.categories.get.getData()
        if (catsData) {
            const instantiatedCats = catsData.map((catData) => (
                <Fragment key={randomString()}>
                    <CategoryForm category={catData} onRemove={() => {
                        setCachedCats((old) => old.filter((el) => el?.props.children.props.category.id !== catData.id))
                    }} />
                </Fragment>)
            )
            setCachedCats(instantiatedCats)
        }
    }, [isSuccess])

    if (isLoading) return <SkeletonLoader />;
    if (isError)
        return (
            <Alert
                severity="error"
                title="Something went wrong"
                message={error?.message}
            />
        );

    if (isSuccess) {
        return (
            <div>
                <Button
                    className="mb-4"
                    StartIcon={Plus}
                    onClick={() => {
                        setNewCats((befNewCatData) => {
                            const elKey = randomString()
                            return [<Fragment key={elKey}><CategoryForm onRemove={() => {
                                setNewCats((crrCats) => {
                                    return crrCats.filter((el) => el?.key !== elKey)
                                })
                            }} /></Fragment>, ...befNewCatData]
                        })
                    }}
                >
                    New Category
                </Button>
                <div className="mb-4 space-y-12" ref={categoriesAnimationParentRef} id="cats-container">
                    {newCats && newCats.map((newCat) => newCat)}
                    {cachedCats && cachedCats.map((cat) => cat)}
                </div>
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
