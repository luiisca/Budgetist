import {
  Button,
  Form,
  SkeletonButton,
  SkeletonContainer,
  SkeletonText,
} from "components/ui";
import Head from "next/head";
import Shell from "components/ui/core/Shell";
import { trpc } from "utils/trpc";
import _ from "lodash";
import SalaryForm from "components/simulation/salaryForm";
import { FiPlus } from "react-icons/fi";
import { Alert } from "components/ui/Alert";
import EmptyScreen from "components/ui/core/EmptyScreen";
import { Category } from "@prisma/client";
import { categoryDataClient, CategoryDataInputTypeClient } from "prisma/*";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

const CategoryForm = ({ category }: { category: Category }) => {
  // useForm
  const categoryForm = useForm<CategoryDataInputTypeClient>({
    resolver: zodResolver(categoryDataClient),
  });
  // useEffect with reset
  // useFieldArray for expenses
  // isDisabled for button disabled=
  // mutation.isLoading for button

  return <Form></Form>;
};

const Categories = () => {
  const { data, isLoading, isError, isSuccess, error } =
    trpc.simulation.categories.get.useQuery();

  if (isLoading) return <SkeletonLoader />;
  if (isError)
    return (
      <Alert
        severity="error"
        title="Something went wrong"
        message={error.message}
      />
    );

  if (isSuccess)
    return (
      <div>
        <Button className="mb-4" StartIcon={FiPlus}>
          New Category
        </Button>
        {data?.categories.map((category) => (
          <CategoryForm category={category} />
        ))}
        {data?.categories.length === 0 && (
          <EmptyScreen
            Icon={FiPlus}
            headline="New category"
            description="Budget categories helps you define all your yearly expenses to fine-tune the simulation's result"
          />
        )}
      </div>
    );

  // impossible state
  return null;
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
              <Categories />
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
