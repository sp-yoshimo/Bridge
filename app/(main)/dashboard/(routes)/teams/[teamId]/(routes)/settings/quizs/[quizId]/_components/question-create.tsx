"use client"


import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Choice, Question, Quiz, Team } from "@prisma/client";
import axios from "axios";
import { Loader2, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { QuestionCard } from "./question-card";


//1つのクイズオブジェクトの中の問題一覧。問題作成も可能なコンポーネント
const QuestionCreate = ({
    team,
    quiz
}: {
    team: Team,
    quiz: Quiz & {
        questions: (Question & {
            choices: Choice[]
        })[]
    }
}) => {

    const [isLoading, setIsLoading] = useState(false);

    const { toast } = useToast()
    const router = useRouter();
    const pathname = usePathname();
    
    //クイズの中の問題を作成する関数
    const onCreateQuestion = async () => {

        try {

            setIsLoading(true)

            const response = await axios.post(`/api/team/${team.id}/quiz/${quiz.id}`, {
                content: "",
                position: quiz.questions.length + 1,
            })

            toast({
                title: "問題を作成しました"
            })

            //クエリで特定の問題の編集ページへ
            router.push(`${pathname}?questionId=${response.data.id}`)

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

    return (
        <div className=" w-full">
            <div className="flex flex-col">

                <div className=" p-2 pr-4">
                    <div className=" flex items-center justify-between">
                        <p className=" text-sm text-muted-foreground">
                            問題一覧
                        </p>
                        {isLoading ? (
                            <div className=" p-1 flex items-center justify-center">
                                <Loader2
                                    className=" text-black  dark:text-white  w-4 h-4 animate-spin"
                                />
                            </div>
                        ) : (
                            <div
                                onClick={onCreateQuestion}
                                className=" border-2 border-black dark:border-white rounded-full p-1 flex items-center justify-center hover:opacity-75 transition"
                            >
                                <Plus
                                    className=" text-black cursor-pointer dark:text-white  w-4 h-4"
                                />
                            </div>
                        )}
                    </div>

                    <div className=" mt-5">
                        <div className="flex flex-col ">
                            {quiz.questions.map((question, i) => (
                                <QuestionCard
                                    key={question.id}
                                    question={question}
                                    index={i + 1}
                                />
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
};

export default QuestionCreate;
