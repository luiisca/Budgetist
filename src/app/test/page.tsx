'use client'
import { toast } from "sonner";
import { Button } from "~/components/ui";

export default function Test() {
    return (
        <div className="flex flex-col space-y-6">
            <Button onClick={() =>
                toast('Default toast!')
            }> default</Button >
            <Button onClick={() =>
                toast.success('Succesfully done!')
            }> sucess</Button >
            <Button onClick={() =>
                toast.error('error toast!')
            }> error</Button >
            <Button onClick={() =>
                toast.warning('warning toast!')
            }> warning</Button >
        </div>
    )
}
