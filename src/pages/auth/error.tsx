import Link from "next/link";
import { useRouter } from "next/router";
import z from "zod";

import { Button } from "components/ui";
import { FiX } from "react-icons/fi";
import { SkeletonText } from "components/ui";

import AuthContainer from "components/ui/AuthContainer";

const querySchema = z.object({
  error: z.string().optional(),
});

export default function Error() {
  const router = useRouter();
  const { error } = querySchema.parse(router.query);
  const isTokenVerificationError = error?.toLowerCase() === "verification";
  let errorMsg: React.ReactComponentElement<typeof SkeletonText> | string = <SkeletonText />;
  if (router.isReady) {
    errorMsg = isTokenVerificationError ? "Token is either invalid or expired." : "An error occurred when logging you in. Head back to the login screen and try again.";
  }

  return (
    <AuthContainer>
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <FiX className="h-6 w-6 text-red-600" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
            {error}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">{errorMsg}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-6">
        <Link href="/auth/login" passHref>
          <Button className="flex w-full justify-center">Go back to the login page</Button>
        </Link>
      </div>
    </AuthContainer>
  );
}
