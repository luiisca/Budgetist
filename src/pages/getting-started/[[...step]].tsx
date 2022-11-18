import { User } from "@prisma/client";
import { StepCard } from "components/getting-started/components/StepCard";
import { Steps } from "components/getting-started/components/Steps";
import SimSettings from "components/getting-started/steps-views/SimSettings";
import { UserSettings } from "components/getting-started/steps-views/UserSettings";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { getServerAuthSession } from "server/common/get-server-auth-session";
import { z } from "zod";

interface IOnboardingPageProps {
  user: User;
}

const INITIAL_STEP = "user-settings";
const steps = ["user-settings", "sim-presets"] as const;

const stepTransform = (step: typeof steps[number]) => {
  const stepIndex = steps.indexOf(step);
  if (stepIndex > -1) {
    return steps[stepIndex];
  }
  return INITIAL_STEP;
};

const stepRouteSchema = z.object({
  step: z.array(z.enum(steps)).default([INITIAL_STEP]),
});

const OnboardingPage = (props: IOnboardingPageProps) => {
  const router = useRouter();

  const { user } = props;

  const headers = [
    {
      title: "Welcome to Budgetist",
      subtitle: [
        "We just need some basic info to get your profile setup.",
        "You’ll be able to edit this later.",
      ],
    },
    {
      title: "Set simulation presets",
      subtitle: [
        "Set simulation presets to better simulate your final balance.",
      ],
    },
  ];

  const result = stepRouteSchema.safeParse(router.query);
  const currentStep = result.success ? result.data.step[0] : INITIAL_STEP;

  const goToIndex = (index: number) => {
    const newStep = steps[index];
    router.push(
      {
        pathname: `/getting-started/${stepTransform(newStep)}`,
      },
      undefined
    );
  };

  const currentStepIndex = steps.indexOf(currentStep);

  return (
    <div
      className="dark:text-brand-contrast min-h-screen text-black dark:bg-brand"
      key={router.asPath}
    >
      {/* <Head> */}
      {/*   <title>Budgetist - Getting Started</title> */}
      {/*   <link rel="icon" href="/favicon.ico" /> */}
      {/* </Head> */}

      <div className="mx-auto px-4 py-6 md:py-24">
        <div className="relative">
          <div className="sm:mx-auto sm:w-full sm:max-w-[600px]">
            <div className="mx-auto sm:max-w-[520px]">
              <header>
                <p className="mb-3 font-cal text-[28px] font-medium leading-7">
                  {headers[currentStepIndex]?.title || "Undefined title"}
                </p>

                {headers[currentStepIndex]?.subtitle.map((subtitle, index) => (
                  <p
                    className="font-sans text-sm font-normal text-gray-500"
                    key={index}
                  >
                    {subtitle}
                  </p>
                ))}
              </header>

              <Steps
                maxSteps={steps.length}
                currentStep={currentStepIndex}
                navigateToStep={goToIndex}
              />
            </div>

            <StepCard>
              {currentStep === "user-settings" && (
                <UserSettings user={user} nextStep={() => goToIndex(1)} />
              )}
              {currentStep === "sim-presets" && <SimSettings user={user} />}
            </StepCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const crypto = await import("crypto");
  const session = await getServerAuthSession(context);

  if (!session?.user?.id) {
    return { redirect: { permanent: false, destination: "/auth/login" } };
  }

  const user = await prisma?.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      avatar: true,
      completedOnboarding: true,
      country: true,
      inflation: true,
      currency: true,
      investPerc: true,
      indexReturn: true,
      salary: true,
    },
  });

  if (!user) {
    throw new Error("User from session not found");
  }

  return {
    props: {
      user: {
        ...user,
        emailMd5: crypto.createHash("md5").update(user.email).digest("hex"),
      },
    },
  };
};

export default OnboardingPage;
