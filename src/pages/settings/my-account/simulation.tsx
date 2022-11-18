import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Form,
  NumberInput,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  TextField,
} from "components/ui";
import { getLayout } from "components/ui/core/layouts/SettingsLayout";
import Meta from "components/ui/core/Meta";
import showToast from "components/ui/core/notifications";
import { profileData, ProfileDataInputType } from "prisma/*";
import { Controller, useForm } from "react-hook-form";
import { FiPercent } from "react-icons/fi";
import { trpc } from "utils/trpc";

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="mt-6 mb-8 space-y-6 divide-y">
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
  const { data: user, isLoading } = trpc.user.me.useQuery();
  const mutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      showToast("Settings updated successfully", "success");
    },
    onError: () => {
      showToast("Error updating settings", "error");
    },
  });

  const formMethods = useForm<ProfileDataInputType>({
    resolver: zodResolver(profileData),
    reValidateMode: "onChange",
  });

  const {
    control,
    formState: { isSubmitting },
  } = formMethods;

  if (isLoading || !user) return <SkeletonLoader />;
  const isDisabled = isSubmitting;

  return (
    <>
      <Form
        form={formMethods}
        handleSubmit={(values) => {
          mutation.mutate(values);
        }}
        className="space-y-6"
      >
        <Meta
          title="Simulation"
          description="Manage configs for your Budgetist simulation"
        />

        {/* country */}
        <Controller
          name="country"
          control={control}
          defaultValue={user.country}
          render={({ field }) => (
            <TextField
              {...field}
              onChange={(e) =>
                e && formMethods.setValue("country", e.target.value)
              }
              label="Country"
              placeholder="Peru"
            />
          )}
        />

        {/* country inflation */}
        <div>
          <NumberInput
            control={control}
            name="inflation"
            label="Country inflation"
            addOnSuffix={<FiPercent />}
            placeholder="8"
            defaultValue={user.inflation}
          />
        </div>

        {/* currency */}
        <Controller
          name="currency"
          defaultValue={user.currency}
          render={({ field }) => (
            <TextField
              {...field}
              label="Country Currency"
              placeholder="PEN"
              defaultValue={user.currency}
              onChange={(e) =>
                e && formMethods.setValue("currency", e.target.value)
              }
            />
          )}
        />

        {/* Investment per year perc */}
        <div>
          <NumberInput
            control={control}
            name="investPerc"
            label="Investment percentage"
            addOnSuffix={<FiPercent />}
            placeholder="75"
            defaultValue={user.investPerc}
          />
        </div>

        {/* annual return perc */}
        <div>
          <NumberInput
            control={control}
            name="indexReturn"
            label="Annual return"
            addOnSuffix={<FiPercent />}
            placeholder="7"
            defaultValue={user.indexReturn}
          />
        </div>

        <Button
          disabled={isDisabled}
          color="primary"
          className="mt-8"
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
