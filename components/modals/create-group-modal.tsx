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
    name: z.string().min(1, {
        message: "グループ名は必須です"
    })
})

type formSchemeType = z.infer<typeof formScheme>;


const CreateGroupModal = () => {


    //モーダルデータを取得
    const { isOpen, onClose, type, data } = useModal();
    const { membersWithProfile, team } = data;
    const isModalOpen = isOpen && type === "createGroupModal";



    const { toast } = useToast();
    const router = useRouter();

    //セレクトされたメンバーを格納する状態変数
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([])


    //selectUIで表示させるための整形データ
    const options = membersWithProfile?.map((member) => ({
        value: member.id,
        label: member.profile.name
    }));


    //react-hook-formライブラリの初期化
    const form = useForm<formSchemeType>({
        resolver: zodResolver(formScheme),
        defaultValues: {
            name: ""
        }
    });

    //react-select用のセレクトされたときに呼び出されるする関数
    const handleSelect = (selectedOptions: any) => {

        setSelectedMembers(selectedOptions);

    }


    if (!team) {
        return null;
    }

    //フォーム送信時の処理
    const onSubmit = async (values: formSchemeType) => {
        try {

            if (selectedMembers.length < 2) {
                return toast({
                    title: "メンバーは最低2人以上必要です",
                    variant: "destructive"
                })
            }

            await axios.post(`/api/team/${team.id}/group`, {
                ...values,
                members: selectedMembers
            });
            toast({
                title: "グループを作成しました"
            })
            form.reset();
            onClose();

            router.refresh();

        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
            console.log(error)
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
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <DialogHeader className="pt-5">
                                <DialogTitle className=" text-2xl text-center font-bold">
                                    グループを作成
                                </DialogTitle>
                                <DialogDescription className=" text-center w-3/4 mx-auto">
                                    作成したグループは、オンライン授業で用いることができます
                                </DialogDescription>
                            </DialogHeader>
                            <div className=" p-8 space-y-5">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                グループ名
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className=" w-full focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                                                    placeholder="グループ名を入力 (例:1班, グループ1... など)"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className=" flex flex-col" >
                                    <div>
                                        <h3 className=" font-bold">
                                            メンバー
                                        </h3>
                                    </div>
                                    <div className=" mt-2">
                                        <Select
                                            isMulti
                                            options={options}
                                            onChange={handleSelect}
                                            placeholder="グループメンバーを選択"
                                            noOptionsMessage={() => (<p className="text-muted-foreground">選択できる生徒はいません</p>)}
                                            theme={theme => ({
                                                ...theme,
                                                borderRadius: 7,
                                            })}
                                            className="my-react-select-container"
                                            classNamePrefix="my-react-select"
                                        />
                                    </div>
                                </div>
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

export default CreateGroupModal;
