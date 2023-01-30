import { GetServerSidePropsContext } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { FaGoogle, FaGithub } from "react-icons/fa";

import { Alert } from "components/ui/Alert";
import { Button, EmailField, Label } from "components/ui";

import { ErrorCode } from "utils/auth";

import AuthContainer from "components/ui/AuthContainer";
import { WEBAPP_URL } from "utils/constants";
import { getServerAuthSession } from "server/common/get-server-auth-session";

export default function Login() {
  const router = useRouter();
  const form = useForm<{ email: string }>();
  const { formState } = form;
  const { isSubmitting } = formState;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [oAuthError, setOAuthError] = useState<boolean>(false);

  const errorMessages: { [key: string]: string } = useMemo(
    () => ({
      [ErrorCode.UserNotFound]:
        "No account exists matching that email address.",
      [ErrorCode.InternalServerError]:
        "Something went wrong. Please try again.",
      [ErrorCode.ThirdPartyIdentityProviderEnabled]:
        "Your account was created using an Identity Provider.",
      [ErrorCode.IncorrectProvider]:
        "Account registered with another provider.",
    }),
    []
  );

  useEffect(() => {
    if (router.query?.error) {
      setOAuthError(true);
      if (router.query?.error === "OAuthAccountNotLinked") {
        // @TODO: feat: log them in through magic link (redirect to verify page)
        setErrorMessage(
          errorMessages[ErrorCode.IncorrectProvider] || "Something went wrong."
        );
      } else {
        setErrorMessage(
          errorMessages[router.query?.error as string] ||
            "Something went wrong."
        );
      }
      // Clean URL to get rid of error query
      router
        .push(`${WEBAPP_URL}/auth/login`, undefined, { shallow: true })
        .catch(console.error);
    }
  }, [errorMessages, router, router.query?.error]);

  return (
    <>
      <AuthContainer showLogo heading="Log in to Budgetist">
        <>
          {errorMessage && oAuthError && (
            <Alert className="mt-4" severity="error" title={errorMessage} />
          )}
          {errorMessage && !oAuthError && (
            <Alert severity="error" title={errorMessage} />
          )}
          <div className="mt-5">
            <Button
              color="secondary"
              className="flex w-full justify-center"
              StartIcon={FaGoogle}
              data-testid="google"
              onClick={async (e) => {
                e.preventDefault();
                await signIn("google");
              }}
            >
              Sign in with Google
            </Button>
          </div>
          <div className="my-5">
            <Button
              color="secondary"
              StartIcon={FaGithub}
              className="flex w-full justify-center"
              data-testid="github"
              onClick={async (e) => {
                e.preventDefault();
                await signIn("github");
              }}
            >
              Sign in with Github
            </Button>
          </div>
        </>
        <div className="relative my-4">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-gray-300 dark:border-dark-350" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-gray-500 dark:bg-transparent dark:text-transparent">
              or
            </span>
          </div>
        </div>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(async (values) => {
            setErrorMessage(null);
            if (values.email && values.email !== "") {
              router.push(
                new URL(
                  `${WEBAPP_URL}/auth/verify?email=${values.email}` as string
                ),
                new URL(`${WEBAPP_URL}/auth/verify`)
              );

              return;
            }
            setErrorMessage("Something went wrong.");
          })}
          data-testid="login-form"
        >
          <Label htmlFor="email">Magic Link</Label>
          <EmailField
            {...form.register("email")}
            defaultValue={router.query.email || ""}
            placeholder="hello@email.com"
            required
          />
          <div className="flex space-y-2">
            <Button
              className="flex w-full justify-center"
              type="submit"
              disabled={isSubmitting}
            >
              Sign in
            </Button>
          </div>
        </form>
      </AuthContainer>
    </>
  );
}

export async function getServerSideProps({
  req,
  res,
}: GetServerSidePropsContext) {
  const session = await getServerAuthSession({ req, res });

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
