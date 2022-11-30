import {
  Label,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
} from "components/ui";
import Head from "next/head";
import Shell from "components/ui/core/Shell";
import { trpc } from "utils/trpc";
import _ from "lodash";
import SalaryForm from "components/simulation/salaryForm";

const SkeletonLoader = () => {
  return (
    <SkeletonContainer>
      <div className="mt-6 mb-8 space-y-6 divide-y">
        <SkeletonText className="h-8 w-full" />
        <div className="flex space-x-3">
          <SkeletonText className="h-8 w-full flex-[1_1_80%]" />
          <SkeletonText className="h-8 w-full" />
        </div>
        <SkeletonText className="h-8 w-full" />

        <SkeletonButton className="mr-6 h-8 w-20 rounded-md p-5" />
      </div>
    </SkeletonContainer>
  );
};

export default function Simulation() {
  const { data: user, isLoading } = trpc.user.me.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  // const yearsEl = useRef<HTMLInputElement>(null);
  // const [balance, setBalance] = useState<number>(salary.amount);

  return (
    <>
      <Head>
        <title>Simulation | Budgetist</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Shell
        heading="Current balance"
        subtitle="As of 12/11/2022"
        // CTA={
        //   balance ? (
        //     <div className="text-3xl text-black">{Math.round(balance)}</div>
        //   ) : null
        // }
      >
        {/* salary form */}
        {isLoading || !user ? (
          <SkeletonLoader />
        ) : (
          <>
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-medium">Salary</h2>
              <SalaryForm user={user} />
            </div>

            <div>
              <h2 className="mb-4 text-lg font-medium">Categories</h2>
            </div>
          </>
        )}
        {/* run simulation */}
        {/* <div className="mt-6 flex justify-start"> */}
        {/*   <Input */}
        {/*     id="years" */}
        {/*     name="years" */}
        {/*     required */}
        {/*     type="number" */}
        {/*     ref={yearsEl} */}
        {/*     className="w-auto rounded-r-none" */}
        {/*   /> */}
        {/*   <Button */}
        {/*     onClick={() => { */}
        {/*       setBalance(getTotalBalance(Number(yearsEl?.current?.value))); */}
        {/*     }} */}
        {/*     className="rounded-l-none py-2 px-4" */}
        {/*   > */}
        {/*     Run */}
        {/*   </Button> */}
        {/* </div> */}
      </Shell>
    </>
  );
}
