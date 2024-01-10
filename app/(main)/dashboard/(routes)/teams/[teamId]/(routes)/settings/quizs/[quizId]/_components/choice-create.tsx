"use client"

import { useToast } from "@/components/ui/use-toast";
import { db } from "@/lib/db";
import { Choice, Question, Quiz, Team } from "@prisma/client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { QuestionContentForm } from "./question-content-form";
import { Trash, Trash2 } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ChoiceCard } from "./choice-card";

const ChoiceCreate = ({
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
    const searchParams = useSearchParams();

    //現在いる問題ページのidを取得
    const questionId = searchParams.get("questionId")

    if (quiz.questions.length === 0) {
        return (
            <div className="flex items-center justify-center text-muted-foreground pt-10">
                問題を作成してください
            </div>
        )
    }

    if (!questionId) {
        return (
            <div className="flex items-center justify-center text-muted-foreground pt-10">
                問題を選択してください
            </div>
        )
    }

    let question: any;
    for (const quiz_question of quiz.questions) {

        if (quiz_question.id === questionId) {
            question = quiz_question
        }

    };

    //選択肢は4つまで追加できる
    const canAddChoices = question.choices.length < 4 ? true : false

    if (!question) {
        return (
            <div className="flex items-center justify-center text-muted-foreground pt-10">
                問題を選択してください
            </div>
        )
    }

    //既に正解を設定した選択肢があるか
    const ExistingCorrect = question.choices.some((choice: Choice) => choice.isCorect)

    //問題削除
    const onDeleteQuestion = async () => {
        try {

            setIsLoading(true)

            const response = await axios.delete(`/api/team/${team.id}/quiz/${quiz.id}/question/${question.id}`)

            toast({
                title: "問題を削除しました"
            });

            const updatedQuestions: Array<Record<string, any>> = response.data

            router.refresh();

            //今回削除した問題の一つ前の問題へ移動
            if (updatedQuestions[updatedQuestions.length - 1]) {
                router.push(`/dashboard/teams/${team.id}/settings/quizs/${quiz.id}?questionId=${updatedQuestions[updatedQuestions.length - 1].id}`)
                router.refresh()
            } else {
                router.push(`/dashboard/teams/${team.id}/settings/quizs/${quiz.id}`)
                router.refresh()
            }

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



    //選択肢追加
    const onAddChoice = async () => {
        try {

            setIsLoading(true);
            await axios.post(`/api/team/${team.id}/quiz/${quiz.id}/question/${question.id}`);
            toast({
                title: "選択肢を作成しました"
            })

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
        <div className="flex flex-col p-3">
            <div className=" w-full flex items-center justify-between">
                <p className=" text-muted-foreground">
                    {question?.position}問目
                </p>
                <Button
                    size="icon"
                    disabled={isLoading}
                    onClick={onDeleteQuestion}
                    className=" bg-rose-500 hover:bg-rose-500 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:opacity-75 transition"
                >
                    <Trash2 className=" text-white" />
                </Button>
            </div>

            {/* 問題文フォームコンポーネント */}
            <div className=" mt-7">
                <QuestionContentForm
                    team={team}
                    question={question}
                    quiz={quiz}
                />
            </div>

            {/* 選択肢作成コンポーネント */}
            <div className=" mt-7">
                <div className="px-0 md:px-6">
                    <div className=" flex items-start justify-between">
                        <h3 className=" font-bold text-xl">
                            選択肢
                        </h3>
                        <div className=" flex flex-col items-end">
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={isLoading || !canAddChoices}
                                onClick={onAddChoice}
                            >
                                選択肢を追加
                            </Button>
                            {!canAddChoices && (
                                <p className=" text-xs text-muted-foreground mt-1">
                                    選択肢は4つまで追加できます
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 選択肢一覧 */}
                    <div className=" mt-3">
                        <div className="flex flex-col space-y-3">

                            {question.choices.map((choice: Choice) => (
                                <ChoiceCard
                                    key={choice.id}
                                    team={team}
                                    question={question}
                                    quiz={quiz}
                                    choice={choice}
                                    existingCorrect={ExistingCorrect}
                                />
                            ))}

                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
};

export default ChoiceCreate;
