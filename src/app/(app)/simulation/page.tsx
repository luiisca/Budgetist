import { Metadata } from "next";
import BalanceHeader from "./_components/balance-header";
import RunSimForm from "./_components/run-sim-form";
import BalanceHistory from "./_components/balance-history";
import Salaries from "./_components/salaries";
import Categories from "./_components/categories";
import Test from "./test";

export const metadata: Metadata = {
    title: "Simulation | Budgetist",
    description: "simulate your total balance after x years",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default async function Simulation() {
    return (
        <>
            <BalanceHeader />
            <Test />
            <div className="flex flex-col space-y-8">
                <div>
                    <h2 className="mb-4 text-lg font-medium">Run Simulation</h2>
                    {/* <RunSimForm /> */}
                </div>
                <div>
                    {/* <BalanceHistory /> */}
                </div>
                <div>
                    <h2 className="mb-4 text-lg font-medium">Salaries</h2>
                    <Salaries />
                </div>

                <div>
                    <h2 className="mb-4 text-lg font-medium">Categories</h2>
                    <Categories />
                </div>
            </div>
        </>
    )
}
