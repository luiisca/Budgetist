import Link from "next/link";

export default async function Logout() {
    return (
        <div>
            <div>You have logged out!</div>
            <Link href='/auth/login'>Go back to login page</Link>
        </div>
    )
}

