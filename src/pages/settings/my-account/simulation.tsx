import { zodResolver } from "@hookform/resolvers/zod";
import { SimSettingsFields } from "components/getting-started/steps-views/components";
import {
  Button,
  Form,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
} from "components/ui";
import { getLayout } from "components/ui/core/layouts/SettingsLayout";
import Meta from "components/ui/core/Meta";
import showToast from "components/ui/core/notifications";
import { profileData } from "prisma/*";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  DEFAULT_CURRENCY,
  DEFAULT_INDEX_RETURN,
  DEFAULT_INFLATION,
  DEFAULT_INVEST_PERC,
} from "utils/constants";
import {
  getCountryLabel,
  getCurrency,
  selectOptionsData,
  SettingsFormValues,
} from "utils/sim-settings";
import { trpc } from "utils/trpc";

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="mt-6 mb-8 space-y-6">
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />

        <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
      </div>
    </SkeletonContainer>
  );
};

const ProfileView = () => {
  const { data: user, isLoading } = trpc.user.me.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const utils = trpc.useContext();
  const mutation = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      showToast("Settings updated successfully", "success");
      await utils.user.me.invalidate();
    },
    onError: async () => {
      showToast("Error updating settings", "error");
      await utils.user.me.invalidate();
    },
  });

  const formMethods = useForm<SettingsFormValues>({
    resolver: zodResolver(
      profileData.extend({
        country: selectOptionsData,
        currency: selectOptionsData,
      })
    ),
    reValidateMode: "onChange",
  });

  const {
    reset,
    formState: { isSubmitting, isDirty },
  } = formMethods;

  useEffect(() => {
    if (user) {
      reset(
        {
          country: {
            value: user.country,
            label: getCountryLabel(user.country),
          },
          inflation: user.inflation,
          currency: getCurrency(user.currency, user.country),
          investPerc: user.investPerc,
          indexReturn: user.indexReturn,
        },
        {
          keepDirtyValues: true,
        }
      );
    }
  }, [reset, user]);

  if (isLoading || !user) return <SkeletonLoader />;
  const isDisabled = isSubmitting || !isDirty;

  return (
    <>
      <Form
        form={formMethods}
        handleSubmit={(values) => {
          mutation.mutate({
            ...values,
            investPerc: Number(values.investPerc) || DEFAULT_INVEST_PERC,
            inflation: Number(values.inflation) || DEFAULT_INFLATION,
            indexReturn: Number(values.indexReturn) || DEFAULT_INDEX_RETURN,
            country: values.country?.value || user.country,
            currency: values.currency?.value || DEFAULT_CURRENCY,
          });
        }}
        className="space-y-6"
      >
        <Meta
          title="Simulation"
          description="Manage configs for your Budgetist simulation"
        />

        <SimSettingsFields form={formMethods} />

        <Button
          disabled={isDisabled}
          color="primary"
          className="mt-6"
          type="submit"
          loading={mutation.isLoading}
        >
          Update
        </Button>
      </Form>
    </>
  );
};

ProfileView.getLayout = getLayout;

export default ProfileView;
