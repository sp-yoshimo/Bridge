"use client"

import * as z from "zod"
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form"
import { useModal } from "@/hooks/use-modal";
import { Button } from "../ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";




const StartTeamModal = () => {

    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "startTeamModal"

    const { teamId } = data;

    const router = useRouter()


    if (!teamId) {
        return null;
    }

    return (
        <Dialog
            onOpenChange={() => {
                onClose();
            }}
            open={isModalOpen}>
            <DialogContent className=" p-0 overflow-hidden">
                <div>
                    <DialogHeader className="pt-5">
                        <DialogTitle className=" text-2xl text-center font-bold">
                            アナウンス
                        </DialogTitle>
                    </DialogHeader>
                    <div className="">
                        <DialogDescription className=" text-center p-5">
                            チームモードが始まりました。ページを移行します
                        </DialogDescription>
                        <DialogFooter className="border-t w-full p-5">
                            <div className="w-full flex justify-end items-center">
                                <Button
                                    onClick={() => {
                                        router.push(`/online?teamId=${teamId}`)
                                        onClose();
                                    }}
                                    className={`bg-sky-600 text-white hover:bg-sky-700 transition`}>
                                    了解
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
};

export default StartTeamModal;
