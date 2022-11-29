import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import crypto from "crypto";

import { User } from "@prisma/client";
import { trpc } from "utils/trpc";
import { profileData, ProfileDataInputType } from "prisma/*";
import { Button, Form, TextField } from "components/ui";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import showToast from "components/ui/core/notifications";
import { Avatar } from "components/ui/Avatar";
import ImageUploader from "components/ui/core/ImageUploader";

interface IUserSettingsProps {
  user: User;
  nextStep: () => void;
}

const UserSettings = (props: IUserSettingsProps) => {
  const { user, nextStep } = props;

  const formMethods = useForm<
    Omit<ProfileDataInputType, "inflation" | "investPerc" | "indexReturn">
  >({
    resolver: zodResolver(
      profileData.omit({ inflation: true, investPerc: true, indexReturn: true })
    ),
    reValidateMode: "onChange",
  });

  const { reset } = formMethods;

  useEffect(() => {
    if (user) {
      reset(
        {
          avatar: user?.avatar || "",
          username: user?.username || "",
          name: user?.name || "",
        },
        {
          keepDirtyValues: true,
        }
      );
    }
  }, [reset, user]);

  const utils = trpc.useContext();

  const emailMd5 = crypto
    .createHash("md5")
    .update(user?.email || "example@example.com")
    .digest("hex");

  const onSuccess = async () => {
    await utils.user.me.invalidate();
    nextStep();
  };
  const onError = async () => {
    showToast(
      "There was a problem saving your data. Please try again.",
      "error"
    );
  };
  const mutation = trpc.user.updateProfile.useMutation({
    onSuccess: onSuccess,
    onError: onError,
  });

  return (
    <Form
      form={formMethods}
      handleSubmit={(values) => {
        mutation.mutate(values);
      }}
    >
      {/*country, inflation, currency*/}
      <div className="flex items-center">
        <Controller
          control={formMethods.control}
          name="avatar"
          render={({ field }) => (
            <>
              <Avatar
                alt=""
                imageSrc={field.value}
                gravatarFallbackMd5={emailMd5}
                size="lg"
              />
              <div className="ml-4">
                <ImageUploader
                  target="avatar"
                  id="avatar-upload"
                  buttonMsg="Change Avatar"
                  handleAvatarChange={(newAvatar) => {
                    field.onChange(newAvatar);
                  }}
                  imageSrc={field.value}
                />
              </div>
            </>
          )}
        />
      </div>
      <div className="mt-8">
        <TextField label="Username" {...formMethods.register("username")} />
      </div>
      <div className="mt-8">
        <TextField
          label="Name"
          placeholder="John Doe"
          {...formMethods.register("name")}
        />
      </div>

      <Button
        type="submit"
        color="primary"
        className="mt-8 flex w-full flex-row justify-center"
        loading={mutation.isLoading}
      >
        Next Step
        <ArrowRightIcon
          className="ml-2 h-4 w-4 self-center"
          aria-hidden="true"
        />
      </Button>
    </Form>
  );
};

export { UserSettings };
