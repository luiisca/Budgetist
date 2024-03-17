'use client'

import * as React from "react";
import { useForm, useFieldArray, useWatch, Control } from "react-hook-form";
import VerticalTabItem from "../settings/_components/vertical-tab-item";
import { ArrowLeft } from "lucide-react";
import { Slider } from "~/components/ui/slider";
import * as SliderPrimitive from "@radix-ui/react-slider";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/core/dialog"
import { Button, Input, Label } from "~/components/ui";
import { cn } from "~/lib/cn";


type FormValues = {
    cart: {
        name: string;
        price: number;
        quantity: number;
    }[];
};


const Total = ({ control }: { control: Control<FormValues> }) => {
    const formValues = useWatch({
        name: "cart",
        control
    });
    const total = formValues.reduce(
        (acc, current) => acc + (current.price || 0) * (current.quantity || 0),
        0
    );
    return <p>Total Amount: {total}</p>;
};


export default function Test() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input id="name" value="Pedro Duarte" className="col-span-3" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Input id="picture" type="file" accept="image/*" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button>
                            Save
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button color="secondary">Cancel</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
