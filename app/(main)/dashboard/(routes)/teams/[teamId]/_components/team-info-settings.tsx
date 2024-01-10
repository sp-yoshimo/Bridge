"use client"

import * as z from "zod"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Team } from "@prisma/client"
import { Info, Loader2, X } from "lucide-react"
import {
    Form,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
    FormControl
} from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/file-upload"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

const formScheme = z.object({
    name: z.string().min(1, {
        message: "チーム名は必須です"
    }),
    description: z.string(),
    imageUrl: z.string()
})

type formSchemeType = z.infer<typeof formScheme>


export const TeamInfoSettings = ({
    team
}: {
    team: Team
}) => {


    const router = useRouter();
    const { toast } = useToast();

    const [isImageEditing, setIsImageEditing] = useState(false);


    const form = useForm<formSchemeType>({
        resolver: zodResolver(formScheme),
        defaultValues: {
            name: team.name,
            description: team.description ? team.description : "",
            imageUrl: team.imageUrl ? team.imageUrl : ""
        }
    });


    const onSubmit = async (values: formSchemeType) => {
        try {

            await axios.patch(`/api/team/${team.id}`, values);
            router.refresh();
            toast({
                title: "チーム情報を更新しました"
            })

        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
        }
    }


    return (

        <div>
            <div className=" justify-between w-full flex items-end md:items-center">
                <div className="flex items-center gap-x-2 pr-2 md:p-0">
                    <div className="hidden sm:flex h-10 w-10 bg-sky-200/50 dark:bg-sky-200 rounded-xl items-center justify-center">
                        <Info className=" h-6 w-6 text-sky-600" />
                    </div>
                    <div className=" mt-2 md:mt-0">
                        <h3 className="text-xl md:text-2xl">
                            チーム情報の設定
                        </h3>
                    </div>
                </div>
                <Button
                    disabled={form.formState.isSubmitting}
                    onClick={form.handleSubmit(onSubmit)}
                    className=" ml-auto"
                >
                    {form.formState.isSubmitting ? (
                        <Loader2 className=" animate-spin" />
                    ) : (
                        <p>
                            保存
                        </p>
                    )}
                </Button>
            </div>

            <div className=" my-5">
                <p className=" text-xs text-muted-foreground">
                    保存ボタンを押さないと変更が適用されません
                </p>
                <Separator className=" mt-2" />
            </div>

            <div className="">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className=" space-y-10"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        チーム名(必須)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="チーム名を入力"
                                            disabled={form.formState.isSubmitting}
                                            {...field}
                                            className="focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        チームの説明(任意)
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="チームの説明を入力(任意)"
                                            rows={5}
                                            disabled={form.formState.isSubmitting}
                                            {...field}
                                            className="focus-visible:ring-sky-500 focus-visible:ring-offset-0 z-0"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <div className="block sm:flex items-center justify-between">
                                            <p className=" mb-3">
                                                チーム画像(任意)
                                            </p>
                                            <div className=" flex md:hidden items-center">
                                                <div>
                                                    {field.value != "" && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className=" mr-2"
                                                            onClick={() => field.onChange("")}
                                                        >
                                                            デフォルト
                                                        </Button>
                                                    )}
                                                </div>
                                                <Button variant="default" size="sm" onClick={() => setIsImageEditing(true)}>
                                                    編集する
                                                </Button>
                                            </div>
                                        </div>
                                    </FormLabel>
                                    {isImageEditing ? (
                                        <div className="w-full relative">
                                            <FileUpload
                                                endpoint="teamImage"
                                                onChange={field.onChange}
                                                onComplete={() => {
                                                    setIsImageEditing(false)
                                                }}
                                            />
                                            <div
                                                onClick={() => setIsImageEditing(false)}
                                                className=" absolute cursor-pointer -top-3 -right-3 h-5 w-5 bg-rose-500 rounded-full p-4 flex items-center justify-center">
                                                <div>
                                                    <X className=" text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className=" w-full">
                                            <div className=" relative aspect-video rounded-md overflow-hidden">
                                                <Image
                                                    fill
                                                    alt="team-image"
                                                    className=" object-cover "
                                                    src={field.value ? field.value : "/images/default-team-img.jpg"}
                                                />
                                                <div className=" absolute top-0 w-full hidden md:block p-3">
                                                    <div className=" flex items-center justify-between">
                                                        <div>
                                                            {field.value != "" && (
                                                                <Button
                                                                    variant="secondary"
                                                                    onClick={() => field.onChange("")}
                                                                >
                                                                    デフォルトに戻す
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <Button variant="default" onClick={() => setIsImageEditing(true)}>
                                                            編集する
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </div>

        </div>

    )
}