"use client"


import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useModal } from "@/hooks/use-modal";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

//危険な設定ゾーン
const DangerSettings = () => {

    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [isOpen, setIsOpen] = useState(false);

    const { onOpen } = useModal()
    const { toast } = useToast()

    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
    }, []);

    const onDelete = async () => {
        try {

            setIsLoading(true)

            await axios.delete(`/api/profile`);
            toast({
                title: "アカウントを削除しました"
            })

            window.location.href = "/"

        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isMounted) {
        return null
    }

    return (
        <>
            <Dialog
                open={isOpen}
                onOpenChange={() => setIsOpen(false)}
            >
                <DialogContent className=" p-0 overflow-hidden">
                    <div>
                        <DialogHeader className="py-5">
                            <DialogTitle className=" text-2xl text-center font-bold">
                                確認
                            </DialogTitle>
                            <DialogDescription className=" text-lg text-center w-3/4 mx-auto">
                                本当にアカウントを削除しますか？
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="border-t w-full">
                            <div className="w-full flex justify-between items-center py-3 px-4">
                                <Button variant="ghost" type="button" onClick={() => {
                                    setIsOpen(false);
                                }}>
                                    キャンセル
                                </Button>
                                <Button
                                    onClick={onDelete}
                                    disabled={isLoading}
                                    variant="destructive"
                                    >
                                    削除
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
            <div>

                <div className=" w-full flex items-center justify-between">
                    <div className=" flex flex-col">
                        <p className=" font-bold">
                            アカウントを削除
                        </p>
                        <p className=" text-muted-foreground text-sm">
                            一度消したアカウントは二度と元に戻りません
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            setIsOpen(true);
                        }}
                    >
                        アカウントを削除
                    </Button>
                </div>

            </div>
        </>

    )
};

export default DangerSettings;
