'use client'

import { useContext, useEffect, useState } from "react";
import { z } from "zod";
import {
    Control,
    useFieldArray,
    UseFieldArrayReturn,
    useForm,
    useFormContext,
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
    Tooltip,
} from "~/components/ui";
import { RouterOutputs } from "~/lib/trpc/shared";
import { Alert } from "~/components/ui/alert";
import EmptyScreen from "~/components/ui/empty-screen";
import {
    catData,
    CatInputDataType,
} from "prisma/zod-utils";
import {
    getCountryLocaleName,
    getCurrencyLocaleName,
    getCurrencyOptions,
} from "~/lib/sim-settings";
import {
    DEFAULT_FREQUENCY,
    CATEGORY_INFL_TYPES,
    SELECT_PER_CAT_VAL,
    SELECT_PER_CAT_LABEL,
    SELECT_OUTCOME_VAL,
    SELECT_OUTCOME_LABEL,
    SELECT_INCOME_VAL,
    SELECT_INCOME_LABEL,
    getLabel,
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
import useUpdateInflation from "~/lib/hooks/useUpdateInflation";
import Switch from "~/components/ui/core/switch";
import { Dialog, DialogTrigger } from "~/components/ui/core/dialog";
import { DialogContentConfirmation } from "~/components/ui/custom-dialog";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { api } from "~/lib/trpc/react";
import TitleWithInfo from "../title-with-info";
import { CountryInflInput, CountrySelect } from "../fields";
import omit from "~/lib/omit"
import { BalanceContext } from "../../_lib/context";

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
    // form
    const categoryForm = useForm<CatInputDataType>({
        resolver: zodResolver(catData),
        reValidateMode: "onChange",
    });
    const { reset, register, control } = categoryForm;
    const [typeWatcher, freqTypeWatcher, inflTypeWatcher] = useWatch({
        control,
        name: ["type", 'freqType', 'inflType'],
    });

    // mutation
    const { dispatch: balanceDispatch } = useContext(BalanceContext)
    const utils = api.useUtils();
    const categoryMutation = api.simulation.categories.createOrUpdate.useMutation({
        onMutate: () => {
            balanceDispatch({
                type: "TOTAL_BAL_LOADING",
                totalBalanceLoading: true,
            });
        },
        onSuccess: async () => {
            toast.success(`Category ${category?.id ? "updated" : "created"} successfully`);
            await utils.simulation.categories.invalidate();
            onRemove && onRemove();
        },
        onError: async () => {
            toast.error("Could not add category. Please try again");
            await utils.simulation.categories.invalidate();
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
            await utils.simulation.categories.invalidate();
        },
        onError: async () => {
            toast.error("Could not delete category. Please try again.");
            await utils.simulation.categories.invalidate();
        },
        async onSettled() {
            await utils.simulation.categories.invalidate();
        },
    });

    const recordsDisabledState = useState<boolean>(false);
    const [recordsDisabled] = recordsDisabledState;
    const [deleteCategoryOpen, setDeleteCategoryOpen] = useState(false);
    const { updateInflation, isLoadingInfl, isValidInfl } = useUpdateInflation<CatInputDataType>();
    const { data: user, isLoading, isError, isSuccess, error } = api.user.me.useQuery();
    useEffect(() => {
        const currencyValue = category?.currency || (user?.currency as string);
        const optionFields = {
            currency: {
                value: currencyValue,
                label: getCurrencyLocaleName(currencyValue, user?.country)
            },
            country: {
                value: category?.country || user?.country,
                label: getCountryLocaleName(category?.country || (user?.country as string)),
            },
            inflType: getSelectOptionWithFallback(category?.inflType as OptionsType, SELECT_PER_CAT_VAL),
            type: getSelectOptionWithFallback(category?.type as OptionsType, SELECT_OUTCOME_VAL),
            freqType: getSelectOptionWithFallback(category?.freqType as OptionsType, SELECT_PER_CAT_VAL),
        }

        reset({
            ...category,
            ...optionFields,
            inflVal: category?.inflVal || user?.inflation,
            frequency: category?.frequency || DEFAULT_FREQUENCY,
            records: category?.records.map((record) => ({
                ...record,
                country: {
                    value: record.country,
                    label: getCountryLocaleName(record.country),
                },
                currency: {
                    value: record.currency,
                    label: getCurrencyLocaleName(record.currency, user?.country)
                },
                type: getSelectOption(record.type as OptionsType),
                title: record.title || "",
                inflation: record.inflation || user?.inflation,
            })),
        });
    }, [user, category, reset]);

    // onSubmit
    const onCategorySubmit = (values: CatInputDataType) => {
        const selectInputsData = {
            currency: values.currency?.value || user?.currency,
            type: values.type.value,
            inflType: values.inflType?.value,
            country: values.country?.value || user?.country,
            inflVal: values.inflVal || user?.inflation,
            icon: values.icon || "Icon",
            records: values.records?.map((record) => ({
                ...record,
                type: record.type.value,
                frequency: record.frequency || DEFAULT_FREQUENCY,
                country: record.country.value || user?.country,
                inflation: record.inflation || user?.inflation,
                currency: record.currency.value || user?.currency,
            })),
            freqType: values.freqType?.value || SELECT_PER_CAT_VAL,
            frequency: values.frequency || DEFAULT_FREQUENCY,
        };
        let input = {
            ...values,
            ...selectInputsData,
        };
        // when would an id be passed
        if (category?.id) {
            input = {
                ...input,
                id: category?.id,
            };
        }

        if (recordsDisabled || (values.records?.length as number) === 0) {
            input = {
                ...input,
                ...omit(values, ["records"]),
                ...omit(selectInputsData, ["records"]),
            };
        }

        categoryMutation.mutate(
            // input as unknown as z.infer<typeof categoryDataServer>
            input
        );
        balanceDispatch({
            type: "TOTAL_BAL_LOADING",
            totalBalanceLoading: true,
        });
    };

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
            <Form<CatInputDataType>
                form={categoryForm}
                handleSubmit={onCategorySubmit}
                className="space-y-6"
            >
                {/* title */}
                <div>
                    <TextField label="Title" placeholder="Rent" {...register("title")} />
                </div>

                {/* type */}
                <div>
                    <ControlledSelect<CatInputDataType>
                        control={control}
                        options={() => BASIC_BAL_TYPES}
                        name="type"
                        label="Type"
                    />
                </div>

                <div className="flex space-x-3">
                    {/* budget */}
                    <div className="flex-[1_1_80%]">
                        <NumberInput<CatInputDataType>
                            control={control}
                            name="budget"
                            label="Monthly Budget"
                            placeholder="Budget"
                        />
                    </div>

                    {/* currency Select*/}
                    <div>
                        <ControlledSelect<CatInputDataType>
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
                                        <CountrySelect<CatInputDataType>
                                            form={categoryForm}
                                            name="country"
                                            control={control}
                                            updateInflation={updateInflation}
                                            inflName="inflVal"
                                        />
                                    </div>

                                    {/* country inflation */}
                                    <div>
                                        <CountryInflInput<CatInputDataType>
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
                    <ControlledSelect<CatInputDataType>
                        control={control}
                        options={() => BASIC_GROUP_TYPES}
                        name="freqType"
                        label="Frequency Type (opt.)"
                    />
                </div>
                {/* frequency */}
                {freqTypeWatcher?.value === "perCat" && (
                    <div className="flex-[1_1_80%]">
                        <NumberInput<CatInputDataType>
                            control={control}
                            name="frequency"
                            label="Yearly Frequency"
                            placeholder={`${DEFAULT_FREQUENCY}`}
                        />
                    </div>
                )}

                {/* expenses records */}
                <RecordsList
                    disabledState={recordsDisabledState}
                    isMutationLoading={categoryMutation.isLoading}
                    user={user}
                />

                <div className="flex items-center space-x-2 pt-3">
                    <Button
                        type="submit"
                        color="primary"
                        disabled={categoryMutation.isLoading}
                    >
                        {category ? "Update" : "Create"}
                    </Button>
                    {category ? (
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
                                            deleteCategoryMutation.mutate({ id: category.id });
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
    const {
        data: categories,
        isLoading,
        isError,
        isSuccess,
        error,
    } = api.simulation.categories.get.useQuery();

    const [newCategories, setNewCategories] = useState<
        Array<Record<string, unknown>>
    >([]);
    const [categoriesAnimationParentRef] = useAutoAnimate<HTMLDivElement>();

    if (isLoading) return <SkeletonLoader />;
    if (isError)
        return (
            <Alert
                severity="error"
                title="Something went wrong"
                message={error?.message}
            />
        );

    if (isSuccess)
        return (
            <div>
                <Button
                    className="mb-4"
                    StartIcon={Plus}
                    onClick={() => setNewCategories([...newCategories, {}])}
                >
                    New Category
                </Button>
                <div className="mb-4 space-y-12" ref={categoriesAnimationParentRef}>
                    {newCategories.map((_, i) => (
                        <CategoryForm
                            key={i}
                            onRemove={() =>
                                setNewCategories([
                                    ...newCategories.slice(0, i),
                                    ...newCategories.slice(i + 1),
                                ])
                            }
                        />
                    ))}
                    {categories?.map((category, i) => (
                        <CategoryForm key={i} category={category} />
                    ))}
                </div>
                {categories?.length === 0 && newCategories?.length === 0 && (
                    <EmptyScreen
                        Icon={Plus}
                        headline="New category"
                        description="Budget categories helps you define all your yearly expenses to fine-tune the simulation's result"
                    />
                )}
            </div>
        );

    // impossible state
    return null;
};

export default Categories;
