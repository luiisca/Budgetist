import { signOut } from "../(auth)/auth";

export default async function Simulation() {
    return (
        <div>
            <h1>Simulation</h1>

            <form
                action={async () => {
                    'use server'

                    await signOut({
                        redirectTo: '/logout'
                    })
                }}
                className="flex flex-col group gap-2">

                <button
                    className="outline-none 
            focus:underline focus:decoration-red-600 
            focus:group-valid:decoration-green-600">
                    Log out
                </button>
            </form>
        </div>

    )
}
