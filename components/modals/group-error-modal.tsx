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




const GroupErrorModal = () => {

    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "groupErrorModal";

    const { teamId } = data;

    const router = useRouter();


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
                            今、メンバーが加入/脱退しました。その影響でグループ使用の条件が満たされなくなりました。したがって、グループの使用を中止します
                        </DialogDescription>
                        <DialogFooter className="border-t w-full p-5">
                            <div className="w-full flex justify-end items-center">
                                <Button
                                    onClick={() => {
                                        window.location.href = `/dashboard/teams/${teamId}/settings?mode=group`
                                        onClose();
                                    }}
                                    type="submit"
                                    className={`bg-sky-600 text-white hover:bg-sky-700 transition`}>
                                    グループ設定へ
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
};

export default GroupErrorModal;
