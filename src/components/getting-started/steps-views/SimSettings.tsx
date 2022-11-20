import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useRouter } from "next/router";
import { profileData } from "prisma/*";
import { useForm } from "react-hook-form";
import { trpc } from "utils/trpc";

import { Button, Form } from "components/ui";
import showToast from "components/ui/core/notifications";
import {
  getCountryLabel,
  getCurrency,
  selectOptionsData,
  SettingsFormValues,
} from "utils/sim-settings";
import { Fields } from "./components";

const SimSettings = ({ user }: { user: User }) => {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(
      profileData.extend({
        country: selectOptionsData,
        currency: selectOptionsData,
      })
    ),
    reValidateMode: "onChange",
    defaultValues: {
      country: { value: user.country, label: getCountryLabel(user.country) },
      inflation: user.inflation || 0,
      currency: getCurrency(user.currency),
      investPerc: user.investPerc || 0,
      indexReturn: user.indexReturn || 0,
    },
  });
  const utils = trpc.useContext();
  const router = useRouter();

  const mutation = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      showToast("Your user profile has been updated successfully.", "success");
      await utils.user.me.refetch();
      router.push("/");
    },
    onError: () => {
      showToast(
        "There was a problem saving your data. Please try again",
        "error"
      );
    },
  });

  return (
    <Form<SettingsFormValues>
      form={form}
      handleSubmit={(values) => {
        mutation.mutate({
          ...values,
          country: values.country?.value,
          currency: values.currency?.value,
          completedOnboarding: true,
        });
      }}
      className="space-y-6"
    >
      <Fields form={form} user={user} />
      <Button
        type="submit"
        className="mt-8 flex w-full flex-row justify-center rounded-md border border-black bg-black p-2 text-center text-sm text-white"
        loading={mutation.isLoading}
      >
        Finish
        <ArrowRightIcon
          className="ml-2 h-4 w-4 self-center"
          aria-hidden="true"
        />
      </Button>
    </Form>
  );
};

export default SimSettings;
