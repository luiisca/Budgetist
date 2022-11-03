import { GetServerSidePropsContext } from "next";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

import { Button } from "components/ui";
import { FiCheck } from "react-icons/fi";

import AuthContainer from "components/ui/AuthContainer";

export default function Logout() {
  const { status } = useSession();
  if (status === "authenticated") signOut({ redirect: false });

  return (
    <AuthContainer>
      <div className="mb-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <FiCheck className="h-6 w-6 text-green-600" />
        </div>
        <div className="mt-3 text-center sm:mt-5">
          <h3
            className="text-lg font-medium leading-6 text-gray-900"
            id="modal-title"
          >
            You&apos;ve been logged out
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              We hope to see you again soon!
            </p>
          </div>
        </div>
      </div>
      <Link href="/auth/login" passHref>
        <Button className="flex w-full justify-center">
          Go back to the login page
        </Button>
      </Link>
    </AuthContainer>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Deleting old cookie manually, remove this code after all existing cookies have expired
  context.res.setHeader(
    "Set-Cookie",
    "next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
  );

  return;
}
