"use client"

import { useModal } from "@/hooks/use-modal";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "../ui/button";

export const GroupMessage = () => {

    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "groupMessage";

    const { message } = data


    return (
        <AlertDialog open={isModalOpen}>
            <AlertDialogContent className=" p-0 overflow-hidden">
                <AlertDialogHeader className=" pt-5">
                    <AlertDialogTitle className="text-2xl text-center font-bold">先生からのアナウンス</AlertDialogTitle>
                </AlertDialogHeader>
                <div>
                    <AlertDialogDescription className=" p-5 text-center text-lg text-black">
                        {message}
                    </AlertDialogDescription>
                </div>
                <AlertDialogFooter className=" p-5 border-t w-full">
                    <div className="w-full flex justify-end items-center">
                        <Button
                            onClick={() => {
                                onClose();
                            }}
                            className=" bg-sky-500 hover:bg-sky-600 transition"
                        >
                            了解
                        </Button>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}