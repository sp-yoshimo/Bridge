"use client"


import * as z from "zod"
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";

import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form";
import {
    Form,
    FormItem,
    FormLabel,
    FormMessage,
    FormField,
    FormControl
} from "@/components/ui/form"
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Choice, Question, Quiz, Team } from "@prisma/client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Edit, X } from "lucide-react";


const formScheme = z.object({
    content: z.string().min(1, {
        message: "問題文を入力してください"
    })
})

type formSchemeType = z.infer<typeof formScheme>


//問題文フォーム
export const QuestionContentForm = ({
    team,
    question,
    quiz
}: {
    team: Team,
    question: Question & {
        choices: Choice[]
    },
    quiz: Quiz
}) => {

    const router = useRouter();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);

    const form = useForm<formSchemeType>({
        resolver: zodResolver(formScheme),
        defaultValues: {
            content: ""
        }
    });

    useEffect(() => {

        form.setValue("content", "");

        if (question.content) {
            form.setValue("content", question.content);
        }

    }, [question.content, form])

    useEffect(() => {
        setIsEditing(false)
    }, [question])

    const onSubmit = async(values: formSchemeType) => {
        try {

            await axios.patch(`/api/team/${team.id}/quiz/${quiz.id}`,{
                ...values,
                questionId: question.id,
                choice: false
            })

            toast({
                title: "問題文を更新しました"
            });
            setIsEditing(false);
            router.refresh();
            
        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
        }
    }

    return (
        <div className="px-0 md:px-6">
            <div>
                <h3 className=" font-bold text-xl">
                    問題文
                </h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Card className="mt-3 bg-secondary p-5 relative">
                            {isEditing && (
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea
                                                        rows={5}
                                                        className="focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                                                        {...field}
                                                        placeholder="問題文を入力"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className=" mt-3 flex items-center justify-end">
                                        <Button
                                            className=""
                                            variant="outline"
                                            disabled={form.formState.isSubmitting}
                                            type="submit"
                                        >
                                            更新
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {!isEditing && (
                                <div className=" ">
                                    {question.content ? (
                                        <p>
                                            {question.content}
                                        </p>
                                    ) : (
                                        <p className=" text-muted-foreground">
                                            問題文がまだありません
                                        </p>
                                    )}
                                </div>
                            )}
                            <div
                                onClick={() => setIsEditing((current) => !current)}
                                className=" absolute cursor-pointer hover:scale-105 transition -top-3 -right-3 w-10 h-10 rounded-full bg-slate-950 dark:bg-white p-2 flex items-center justify-center">
                                {isEditing ? (
                                    <X className=" text-white dark:text-slate-950" />
                                ) : (
                                    <Edit className=" text-white dark:text-slate-950" />
                                )}
                            </div>
                        </Card>
                    </form>
                </Form>
            </div>
        </div>
    )
}