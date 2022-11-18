import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { Button, Form, NumberInput, TextField } from "components/ui";
import showToast from "components/ui/core/notifications";
import { useRouter } from "next/router";
import { profileData, ProfileDataInputType } from "prisma/*";
import { useForm } from "react-hook-form";
import { FiPercent } from "react-icons/fi";
import { trpc } from "utils/trpc";

const SimSettings = ({ user }: { user: User }) => {
  const form = useForm<ProfileDataInputType>({
    resolver: zodResolver(profileData),
    reValidateMode: "onChange",
  });
  const { control } = form;
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

  const onSubmit = (data: ProfileDataInputType) => {
    mutation.mutate({
      ...data,
      completedOnboarding: true,
    });
  };

  return (
    <Form form={form} handleSubmit={onSubmit} className="space-y-6">
      {/* country */}
      <div>
        <TextField
          label="Country"
          placeholder="Peru"
          defaultValue={user.country}
          {...form.register("country")}
        />
      </div>

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
      <div>
        <TextField
          label="Country Currency"
          placeholder="PEN"
          defaultValue={user.currency}
          {...form.register("currency")}
        />
      </div>

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
