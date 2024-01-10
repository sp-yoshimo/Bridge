"use client"

import * as z from "zod"
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import Select from "react-select"

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
import { Input } from "../ui/input";
import { useState } from "react";
import { Member } from "@prisma/client";


const formScheme = z.object({
    title: z.string().min(1, {
        message: "タイトルは必須です"
    }),
})

type formSchemeType = z.infer<typeof formScheme>;


const CreateQuizModal = () => {


    //モーダルデータを取得
    const { isOpen, onClose, type, data } = useModal();
    const { team } = data;
    const isModalOpen = isOpen && type === "createQuizModal";

    const { toast } = useToast();
    const router = useRouter();


    //react-hook-formの初期化
    const form = useForm<formSchemeType>({
        resolver: zodResolver(formScheme),
        defaultValues: {
            title: "",
        }
    })


    if (!team) {
        return null;
    }

    //タイトル等の必要な初期データを送信
    const onInit = async (values: formSchemeType) => {
        try {

            const response = await axios.post(`/api/team/${team.id}/quiz`, values)

            toast({
                title: "クイズを作成しました"
            })

            form.reset();
            onClose();
            router.refresh();

        } catch (error) {

            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
            console.log(error);

        }
    }

    return (
        <Dialog
            onOpenChange={() => {
                form.reset()
                onClose();
            }}
            open={isModalOpen}>
            <DialogContent className=" p-0">
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onInit)}>
                            <DialogHeader className="pt-5">
                                <DialogTitle className=" text-2xl text-center font-bold">
                                    クイズを作成
                                </DialogTitle>
                                <DialogDescription className=" text-center w-3/4 mx-auto">
                                    最初にクイズのタイトルを入力しましょう
                                </DialogDescription>
                            </DialogHeader>
                            <div className=" p-8 space-y-5">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                クイズ名
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className=" w-full focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                                                    placeholder="クイズのタイトルを入力 (例:天体クイズ, 江戸時代の出来事... など)"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>
                            <DialogFooter className="border-t w-full">
                                <div className="w-full flex justify-between items-center py-3 px-4">
                                    <Button variant="ghost" type="button" onClick={() => {
                                        form.reset();
                                        onClose()
                                    }}>
                                        キャンセル
                                    </Button>
                                    <Button
                                        disabled={form.formState.isSubmitting}
                                        type="submit"
                                        className={`bg-sky-600 text-white hover:bg-sky-700 transition ${form.formState.isSubmitting && "opacity-70"}`}>
                                        作成
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
};

export default CreateQuizModal;
