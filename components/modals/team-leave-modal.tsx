"use client"

import axios from "axios";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useModal } from "@/hooks/use-modal";
import { Button } from "../ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";



const TeamLeaveModal = () => {

    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "teamLeaveModal";
    const { team, member } = data;

    const { toast } = useToast();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    if (!team || !member) {
        return null
    }

    const onConfirm = async () => {
        try {
            setIsLoading(true)
            await axios.delete(`/api/team/${team.id}/member/${member.id}`,);
            toast({
                title: "チームを抜けました"
            })
            onClose();

            router.refresh();
            window.location.href = "/dashboard"
            router.refresh();

        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
            console.log(error)
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <Dialog
            onOpenChange={() => {
                onClose();
            }}
            open={isModalOpen}>
            <DialogContent className=" p-0 overflow-hidden">
                <div>
                    <DialogHeader className="py-5">
                        <DialogTitle className=" text-2xl text-center font-bold">
                            確認
                        </DialogTitle>
                        <DialogDescription className=" text-center w-3/4 mx-auto">
                            本当に<span className=" text-sky-500">{team.name}</span>を抜けますか？
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="border-t w-full">
                        <div className="w-full flex justify-between items-center py-3 px-4">
                            <Button variant="ghost" type="button" onClick={() => {
                                onClose()
                            }}>
                                キャンセル
                            </Button>
                            <Button
                                onClick={onConfirm}
                                disabled={isLoading}
                                className={`bg-sky-600 text-white hover:bg-sky-700 transition ${isLoading && "opacity-70"}`}>
                                確定
                            </Button>
                        </div>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
};

export default TeamLeaveModal;
