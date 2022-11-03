import { GetServerSidePropsContext } from "next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { FaGoogle, FaGithub } from "react-icons/fa";

import { Alert } from "components/ui/Alert";
import { Button, Label } from "components/ui";

import { ErrorCode, getSession } from "utils/auth";

import AuthContainer from "components/ui/AuthContainer";
import { WEBAPP_URL } from "utils/constants";

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
        "Account already registered with another provider (Google, Facebook or Magic Link). Please try again using the one you registered your account with. Try to reset your browser if this problem persists.",
    }),
    []
  );

  useEffect(() => {
    if (router.query?.error) {
      if (
        router.query?.error === "OAuthCallback" ||
        router.query?.error === "OAuthAccountNotLinked"
      ) {
        console.log("UH OH");
      } else {
        setOAuthError(true);
        setErrorMessage(
          errorMessages[router.query?.error as string] ||
            "Something went wrong."
        );
      }
      // Clean URL to clean error query
      router.push(`${WEBAPP_URL}/auth/login`, undefined, { shallow: true });
    }
  }, [errorMessages, router, router.query?.error]);

  return (
    <>
      <AuthContainer showLogo heading="Sign in to your account">
        <>
          {oAuthError && (
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
              data-testid="facebook"
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
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-gray-500">or</span>
          </div>
        </div>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(async (values) => {
            setErrorMessage(null);
            console.log("FORM VALUES", values);
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
          <input
            id="email"
            {...form.register("email")}
            defaultValue={router.query.email || ""}
            placeholder="john.doe@example.com"
            required
            className="mb-2 block h-9 w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-400 hover:border-gray-400 focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { req } = context;
  const session = await getSession({ req });

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
