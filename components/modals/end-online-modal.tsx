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
import { useRouter, useSearchParams } from "next/navigation";

export const EndOnlineModal = () => {

    const { isOpen, onClose, type, } = useModal();
    const isModalOpen = isOpen && type === "endOnlineModal";

    const searchParams = useSearchParams();
    const teamId = searchParams.get("teamId");

    const router = useRouter();

    return (
        <AlertDialog open={isModalOpen}>
            <AlertDialogContent className=" p-0 overflow-hidden">
                <AlertDialogHeader className=" pt-5">
                    <AlertDialogTitle className="text-2xl text-center font-bold">アナウンス</AlertDialogTitle>
                </AlertDialogHeader>
                <div>
                    <AlertDialogDescription className=" p-5 text-center">
                        オンライン授業は終了しました
                    </AlertDialogDescription>
                </div>
                <AlertDialogFooter className=" p-5 border-t w-full">
                    <div className="w-full flex justify-end items-center">
                        <Button
                            onClick={() => {
                                onClose();
                                router.push(`/dashboard/teams/${teamId}`)
                                router.refresh();
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