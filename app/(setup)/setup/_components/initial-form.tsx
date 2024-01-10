"use client"

import React, { useState } from "react";
import * as z from "zod"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import axios from "axios"

import {
    Form,
    FormItem,
    FormField,
    FormMessage,
    FormControl,
    FormLabel
} from "@/components/ui/form"
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Loader, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-modal";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";


//初期設定フォームの型を定義
const formScheme = z.object({
    name: z.string().min(1, {
        message: "名前の入力は必須です"
    }).max(10, {
        message: "10文字以内にしてください"
    }),
    imageUrl: z.string().min(1, {
        message: "アイコン画像は必須です"
    }),
    isTeacher: z.boolean().default(false)
})

//フォームスキーマ➡Typescriptタイプへ変換
type formSchemeType = z.infer<typeof formScheme>


//page.tsxから受け取るpropsの型定義
interface InitialFormProps {
    currentImageUrl: string,
}

//初期設定フォームコンポーネント
const InitialForm: React.FC<InitialFormProps> = ({
    currentImageUrl,
}) => {


    const [isEditingImage, setIsEditingImage] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>(currentImageUrl);
    const [isSelectedTeacher, setIsSelectedTeacher] = useState<true | false | null>(null);

    const router = useRouter();

    const { onOpen } = useModal();


    const form = useForm<formSchemeType>({
        resolver: zodResolver(formScheme),
        defaultValues: {
            name: "",
            imageUrl: currentImageUrl,
            isTeacher: false
        }
    })


    //フォーム送信関数
    const onSubmit = async (values: formSchemeType) => {

        //バリデーション(画像とロール)
        if (!imageUrl) {
            return toast({
                title: "アイコン画像を設定してください"
            })
        }

        if (isSelectedTeacher == null) {
            return toast({
                title: "ロールを選択してください"
            })
        }

        //フォームデータの取得
        values.imageUrl = imageUrl
        values.isTeacher = isSelectedTeacher!;


        //サーバーにフォームデータを送信
        try {

            await axios.post("/api/profile", values);
            toast({
                title: "初期設定が完了しました!"
            })

            router.push("/dashboard");


        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
        }

    }



    return (
        <div className=" w-full px-2 lg:p-0 h-[500px]">

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <Card className="h-auto w-full shadow-lg">

                        <div className="  p-1  md:p-5 pt-5">
                            <div className=" space-y-7 px-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                ユーザーネーム
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="ユーザーネームを入力"
                                                    className=" focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                                                    disabled={form.formState.isSubmitting}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Separator />


                                <div>
                                    <FormLabel>
                                        アイコン画像
                                    </FormLabel>
                                    {imageUrl && !isEditingImage && (
                                        <div className="p-5 flex items-center gap-x-5">
                                            <div
                                                onClick={() => onOpen("expandImageModal", { imageUrl })}
                                                className=" relative w-20 h-20 cursor-pointer">
                                                <Image
                                                    src={imageUrl}
                                                    alt="icon"
                                                    fill
                                                    className=" object-cover rounded-full"
                                                />
                                            </div>
                                            <div
                                                onClick={() => setIsEditingImage(true)}
                                            >
                                                <h1 className=" text-sky-500 hover:border-b hover:border-sky-500 cursor-pointer duration-100">
                                                    画像を変える
                                                </h1>
                                            </div>
                                        </div>
                                    )}
                                    {!imageUrl || (imageUrl && isEditingImage) && (
                                        <div className="p-5 flex items-center relative">
                                            <div
                                                onClick={() => setIsEditingImage(false)}
                                                className=" absolute top-5 right-2 bg-rose-500 rounded-full p-1 cursor-pointer">
                                                <X className=" w-5 h-5 text-white" />
                                            </div>
                                            <div className=" w-full dark:border rounded-lg border-dotted border-zinc-500">
                                                <FileUpload
                                                    endpoint="initialProfileImage"
                                                    onChange={(url) => {
                                                        setImageUrl(url!)
                                                        setIsEditingImage(false);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator />


                                <div className=" flex flex-col">
                                    <FormLabel>
                                        ロール {isSelectedTeacher === null && "(未選択)"}{isSelectedTeacher && "(先生を選択中)"}{!isSelectedTeacher && isSelectedTeacher !== null && "(生徒を選択中)"}
                                    </FormLabel>
                                    <p className=" text-xs mt-2 text-muted-foreground">
                                        ロールの設定は後から変更することができません。気を付けて選択してください
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 space-y-4 md:space-y-0 p-1 pt-5 md:p-5">
                                        <Card
                                            onClick={() => setIsSelectedTeacher(true)}
                                            className={cn(
                                                `h-[300px] cursor-pointer flex flex-col justify-between overflow-hidden`,
                                                isSelectedTeacher && "border-sky-500"
                                            )}>
                                            <div className="w-full p-4 border-b">
                                                <h2 className=" text-2xl font-extrabold">
                                                    先生
                                                </h2>
                                                <p className=" break-words text-sm text-muted-foreground">
                                                    先生はオンライン授業を開始することができ、クイズ作成やグループ管理などの機能を使うことができます
                                                </p>
                                            </div>
                                            <div className="relative w-full h-full ">
                                                <Image
                                                    src={`/images/drawkit/9.png`}
                                                    fill
                                                    className=" object-cover"
                                                    alt="image"
                                                />
                                            </div>
                                        </Card>
                                        <Card
                                            onClick={() => setIsSelectedTeacher(false)}
                                            className={cn(
                                                `h-[300px] cursor-pointer flex flex-col justify-between overflow-hidden`,
                                                !isSelectedTeacher && isSelectedTeacher !== null && "border-sky-500"
                                            )}
                                        >
                                            <div className="w-full p-4 border-b">
                                                <h2 className=" text-2xl font-extrabold">
                                                    生徒
                                                </h2>
                                                <p className=" break-words text-sm text-muted-foreground">
                                                    生徒は、先生によって作成されたオンライン授業に参加することができます
                                                </p>
                                            </div>
                                            <div className="relative w-full h-full ">
                                                <Image
                                                    src={`/images/drawkit/2.png`}
                                                    fill
                                                    className=" object-cover"
                                                    alt="image"
                                                />
                                            </div>
                                        </Card>

                                    </div>
                                </div>


                            </div>
                        </div>

                    </Card>

                    <div className=" py-5 pb-10 flex items-center justify-center">
                        <Button
                            className={cn(
                                `w-full md:w-1/2  hover:scale-x-105 transition `,
                                form.formState.isSubmitting && " opacity-70"
                            )}
                            type={form.formState.isSubmitting ? "button" : "submit"}
                            variant="premium"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? (
                                <Loader2 className=" w-4 h-4 animate-spin text-white" />
                            ) : (
                                <p>
                                    保存
                                </p>
                            )}
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    )
};

export default InitialForm;
