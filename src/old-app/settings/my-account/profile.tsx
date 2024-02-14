import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientErrorLike } from "@trpc/client";
import {
  Button,
  Form,
  Label,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
  TextField,
} from "components/ui";
import { Alert } from "components/ui/Alert";
import { Avatar } from "components/ui/Avatar";
import ImageUploader from "components/ui/core/ImageUploader";
import { getLayout } from "components/ui/core/layouts/SettingsLayout";
import Meta from "components/ui/core/Meta";
import showToast from "components/ui/core/notifications";
import { Dialog, DialogContent, DialogTrigger } from "components/ui/Dialog";
import crypto from "crypto";
import { signOut } from "next-auth/react";
import { profileData, ProfileDataInputType } from "prisma/*";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { FiAlertTriangle, FiTrash2 } from "react-icons/fi";
import { AppRouter } from "server/trpc/router/_app";
import { ErrorCode } from "utils/auth";
import { trpc } from "utils/trpc";

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="mt-6 mb-8 space-y-6">
        <div className="flex items-center">
          <SkeletonAvatar className=" h-12 w-12 px-4" />
          <SkeletonButton className=" h-6 w-32 rounded-md p-5" />
        </div>
        <SkeletonText className="h-8 w-full" />
        <SkeletonText className="h-8 w-full" />

        <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
      </div>
    </SkeletonContainer>
  );
};

const ProfileView = () => {
  const utils = trpc.useContext();
  const { data: user, isLoading } = trpc.user.me.useQuery();

  const mutation = trpc.user.updateProfile.useMutation({
    onSuccess: async (_, input) => {
      showToast(
        input.name || input.username
          ? "Settings updated successfully"
          : "Avatar updated successfully",
        "success"
      );
      await utils.user.me.invalidate();
    },
    onError: () => {
      showToast("Error updating settings", "error");
    },
  });

  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [hasDeleteErrors, setHasDeleteErrors] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");

  const emailMd5 = crypto
    .createHash("md5")
    .update(user?.email || "example@example.com")
    .digest("hex");

  const onDeleteMeSuccessMutation = async () => {
    await utils.user.me.invalidate();
    showToast("Your account was deleted", "success");

    setHasDeleteErrors(false); // dismiss any open errors
    signOut({ callbackUrl: "/auth/logout" });
  };

  const onDeleteMeErrorMutation = (error: TRPCClientErrorLike<AppRouter>) => {
    setHasDeleteErrors(true);
    setDeleteErrorMessage(errorMessages[error.message]);
  };
  const deleteMeMutation = trpc.user.deleteMe.useMutation({
    onSuccess: onDeleteMeSuccessMutation,
    onError: onDeleteMeErrorMutation,
    async onSettled() {
      await utils.user.me.invalidate();
    },
  });

  const formMethods = useForm<
    Omit<ProfileDataInputType, "inflation" | "investPerc" | "indexReturn">
  >({
    resolver: zodResolver(
      profileData.omit({ inflation: true, investPerc: true, indexReturn: true })
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
          avatar: user.avatar || "",
          username: user.username || "",
          name: user.name || "",
        },
        {
          keepDirtyValues: true,
        }
      );
    }
  }, [reset, user]);

  const errorMessages: { [key: string]: string } = {
    [ErrorCode.UserNotFound]: "No account exists matching that email address.",
    [ErrorCode.InternalServerError]: "Something went wrong. Please try again",
    [ErrorCode.ThirdPartyIdentityProviderEnabled]:
      "Your account was created using an Identity Provider.",
  };

  if (isLoading || !user) return <SkeletonLoader />;
  const isDisabled = isSubmitting || !isDirty;

  return (
    <>
      <Form
        form={formMethods}
        handleSubmit={(values) => {
          mutation.mutate(values);
        }}
      >
        <Meta
          title="Profile"
          description="Manage settings for your Budgetist profile"
        />
        <div className="flex items-center">
          <Controller
            control={formMethods.control}
            name="avatar"
            render={({ field: { value } }) => (
              <>
                <Avatar
                  alt=""
                  imageSrc={value}
                  gravatarFallbackMd5={emailMd5}
                  size="lg"
                />
                <div className="ml-4">
                  <ImageUploader
                    target="avatar"
                    id="avatar-upload"
                    buttonMsg="Change Avatar"
                    handleAvatarChange={(newAvatar) => {
                      mutation.mutate({ avatar: newAvatar });
                    }}
                    imageSrc={value}
                  />
                </div>
              </>
            )}
          />
        </div>
        <div className="mt-8">
          <TextField
            label="Username"
            defaultValue={user?.username as string}
            {...formMethods.register("username")}
          />
        </div>
        <div className="mt-8">
          <TextField label="Full name" {...formMethods.register("name")} />
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

        <hr className="my-6  border-neutral-200 dark:border-dark-350" />

        <Label>Danger zone</Label>
        {/* Delete account Dialog */}
        <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="delete-account"
              color="destructive"
              className="mt-1 border-2"
              StartIcon={FiTrash2}
            >
              Delete account
            </Button>
          </DialogTrigger>
          <DialogContent
            title="Delete Account"
            description="Are you sure you want to delete your Budgetist account?"
            type="creation"
            actionText="Delete my account"
            Icon={FiAlertTriangle}
            actionOnClick={(e) =>
              e &&
              ((e: Event | React.MouseEvent<HTMLElement, MouseEvent>) => {
                e.preventDefault();
                deleteMeMutation.mutate();
              })(e)
            }
          >
            <>
              <p className="mb-7">
                Are you sure you want to delete your Budgetist account? Any
                preferences you have saved will be lost.
              </p>

              {hasDeleteErrors && (
                <Alert severity="error" title={deleteErrorMessage} />
              )}
            </>
          </DialogContent>
        </Dialog>
      </Form>
    </>
  );
};

ProfileView.getLayout = getLayout;

export default ProfileView;
