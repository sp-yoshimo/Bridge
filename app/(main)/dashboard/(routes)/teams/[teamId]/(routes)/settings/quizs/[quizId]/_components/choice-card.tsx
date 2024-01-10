"use client"

import axios from "axios"
import * as z from "zod";

import { Choice, Question, Quiz, Team } from "@prisma/client"
import { useEffect, useState } from "react"
import {
    Form,
    FormItem,
    FormMessage,
    FormField,
    FormControl,
    FormLabel
} from "@/components/ui/form"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

//選択肢編集の型定義
const formScheme = z.object({
    content: z.string().min(1, {
        message: "選択内容は必須です"
    }),
    isCorrect: z.boolean()
})


type formTypeScheme = z.infer<typeof formScheme>;

//個々の選択肢編集・表示コンポーネント
export const ChoiceCard = ({
    team,
    quiz,
    question,
    choice,
    existingCorrect
}: {
    team: Team,
    quiz: Quiz,
    question: Question,
    choice: Choice,
    existingCorrect: boolean
}) => {

    const [isEditing, setIsEditing] = useState(false);

    const { toast } = useToast();
    const router = useRouter()

    //react-hook-formの初期化
    const form = useForm<formTypeScheme>({
        resolver: zodResolver(formScheme),
        defaultValues: {
            content: "",
            isCorrect: false
        }
    });

    //フォームの初期値更新
    useEffect(() => {

        //選択内容
        if (choice.content) {
            form.setValue("content", choice.content)
        } else {
            form.setValue("content", "")
        }

        //正解かどうか
        if (choice.isCorect) {
            form.setValue("isCorrect", true)
        } else {
            form.setValue("isCorrect", false);
        }

    }, [choice.content, choice.isCorect, form])

    //選択肢の更新の送信処理
    const onSubmit = async (values: formTypeScheme) => {
        console.log(values);

        try {

            await axios.patch(`/api/team/${team.id}/quiz/${quiz.id}/question/${question.id}/choice/${choice.id}`, {
                ...values
            })
            toast({
                title: "選択肢を更新しました"
            })
            setIsEditing(false);
            router.refresh();

        } catch (error) {
            console.log(error);
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
        }

    }


    //選択肢の削除処理
    const onDelete = async () => {
        try {

            await axios.delete(`/api/team/${team.id}/quiz/${quiz.id}/question/${question.id}/choice/${choice.id}`)
            toast({
                title: "選択肢を削除しました",
                
            })
            setIsEditing(false);
            router.refresh();

        } catch (error) {
            console.log(error);
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
        }
    }

    return (
        <Card className=" p-3">
            {!isEditing && (
                <div className=" flex items-center justify-between">

                    {choice.content && (
                        <p>
                            {choice.content}
                        </p>
                    )}
                    {!choice.content && (
                        <p className=" text-sm text-muted-foreground">
                            選択内容がまだありません
                        </p>
                    )}
                    <div className="flex items-center gap-x-1">
                        <Badge variant={choice.isCorect ? "default" : "secondary"}>
                            {choice.isCorect ? "正解" : "不正解"}
                        </Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger className=" focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 focus-visible:outline-none">
                                <MoreVertical className=" w-3 h-3" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right">
                                <DropdownMenuItem
                                    onClick={() => setIsEditing(true)}
                                >
                                    編集
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete()}
                                >
                                    <p className="text-rose-500 hover:text-rose-500">
                                        削除
                                    </p>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                </div>
            )}
            {isEditing && (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="w-full">
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem className=" w-full">
                                        <FormLabel>
                                            選択内容
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="focus-visible:ring-sky-500 w-full focus-visible:ring-offset-0"
                                                placeholder="選択内容を入力"
                                                disabled={form.formState.isSubmitting}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className=" my-3">
                            <FormField
                                control={form.control}
                                name="isCorrect"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-x-2">
                                        <FormControl className=" flex items-center">
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={(existingCorrect && !choice.isCorect) || form.formState.isSubmitting}
                                            />
                                        </FormControl>
                                        <div className="grid gap-1.5 leading-none">
                                            <label
                                                htmlFor="terms1"
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                正解の選択肢としてマークする
                                            </label>
                                            <p className="text-sm text-muted-foreground">
                                                1つの問題の中で正解の選択肢は1つしか選べません
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className=" pt-3 border-t flex items-center justify-end">
                            <div className="flex items-center gap-x-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsEditing(false)}
                                    type="button"
                                    disabled={form.formState.isSubmitting}
                                >
                                    キャンセル
                                </Button>
                                <Button
                                    className=" bg-sky-500 hover:bg-sky-500"
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                >
                                    保存
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            )}
        </Card>
    )
}