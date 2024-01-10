"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useModal } from "@/hooks/use-modal"
import { QuizincludesChildren } from "@/types"
import { Choice, Member, Online, Question, Quiz, Team } from "@prisma/client"
import axios from "axios"
import { FileQuestion, FolderCog, Loader2, MoreHorizontal, MoreVertical, PlayCircle, Settings, Trash } from "lucide-react"
import { redirect, useRouter } from "next/navigation"
import { useState } from "react"

export const QuizSettings = ({
    team,
    member
}: {
    team: Team & {
        quizs: QuizincludesChildren[]
        online: Online | null
    },
    member: Member
}) => {

    if (!team.online) {
        return redirect(`/dashboard/teams/${team.id}`)
    }

    const quizs = team.quizs
    const status = team.online?.status

    const { onOpen } = useModal();
    const { toast } = useToast();
    const router = useRouter();

    const [isLoading, setIsLoading] = useState("");



    //条件を満たしたクイズを習得
    let varifiedQuizs: QuizincludesChildren[] = []
    for (const quiz of quizs) {

        //まず問題が1問以上あるか
        if (quiz.questions.length === 0) {
            continue
        }

        //OKかどうかの判定用変数
        let flag = true

        //個々の問題のバリデーション
        for (const question of quiz.questions) {

            //問題文があるか
            if (!question.content) {
                flag = false
            }

            //選択肢が2つ以上あるか
            if (question.choices.length < 2) {
                flag = false
            }

            //それぞれの選択肢にちゃんと選択内容が書かれているか
            const allContent = question.choices.every((choice) => choice.content);

            if (!allContent) {
                flag = false
            }

            //正解の選択肢が1つあるか
            const correct = question.choices.find((choice) => choice.isCorect);

            if (!correct) {
                flag = false
            }
        }

        if (!flag) {
            continue
        }

        //条件を満たしたクイズを配列に収納
        varifiedQuizs.push(quiz)
    }

    //条件を満たしていないクイズを取得
    let unVerifiedQuizs: QuizincludesChildren[] = []
    for (const quiz of quizs) {
        if (!varifiedQuizs.includes(quiz)) {
            unVerifiedQuizs.push(quiz)
        }
    }




    const onDeleteQuiz = async (quizId: string) => {
        try {

            setIsLoading(quizId)
            await axios.delete(`/api/team/${team.id}/quiz/${quizId}`)
            toast({
                title: "クイズを削除しました"
            })
            router.refresh();

        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            });
            console.log(error);
        } finally {
            setIsLoading("")
        }
    }

    return (
        <div className="mb-5">
            <div className=" justify-between w-full flex items-end md:items-center">
                <div className="block md:flex items-center gap-x-2 pr-2 md:p-0">
                    <div className="hidden sm:flex h-10 w-10 bg-sky-200/50 dark:bg-sky-200 rounded-xl items-center justify-center">
                        <FileQuestion className=" h-6 w-6 text-sky-600" />
                    </div>
                    <div className="mt-2 md:mt-0">
                        <h3 className="text-xl md:text-2xl">
                            クイズの管理
                        </h3>
                    </div>
                </div>
            </div>

            <div className="text-xs md:text-sm my-5">
                <p className=" text-muted-foreground">
                    1: 最初にクイズタイトルを決める
                </p>
                <p className="text-muted-foreground">
                    2: そのクイズに問題を追加していく
                </p>
                <p className=" text-muted-foreground">
                    3: 各々の問題に選択肢を追加する。正解の選択肢も設定しておく
                </p>
                <Separator className=" mt-2" />
            </div>


            <div>
                <div className=" flex justify-between">
                    <div
                        onClick={() => onOpen("explainCreateQuizModal")}
                        className=" font-bold text-sm hover:text-sky-500 transition cursor-pointer">
                        作成したクイズを使用できる条件について
                    </div>
                </div>

                <div className=" my-5">
                    <Separator className="mt-2" />
                </div>
            </div>

            <div>
                <div className=" flex items-center justify-between">
                    <div>
                        <h3 className=" font-bold">
                            作成したクイズ
                        </h3>
                    </div>
                    <div className=" flex flex-col">
                        <Button
                            variant={"outline"}
                            disabled={team.online.status !== "NONE"}
                            onClick={() => onOpen("createQuizModal", { team })}
                        >
                            <p>
                                クイズを作成
                            </p>
                        </Button>
                        {team.online && status !== "NONE" && (
                            <p className=" text-xs text-muted-foreground mt-2">
                                オンライン授業の実施中はクイズ作成を行えません
                            </p>
                        )}
                    </div>
                </div>
                {quizs.length <= 0 && (
                    <div className=" mt-10">
                        <p className=" text-muted-foreground text-center">
                            クイズはありません
                        </p>
                    </div>
                )}
                {quizs.length > 0 && (
                    <div className=" mt-5">
                        {varifiedQuizs.map((quiz: QuizincludesChildren) => {
                            return (
                                <div key={quiz.id}>
                                    <div className="py-3 w-full">

                                        <div className="flex justify-between items-center">
                                            <h3>
                                                {quiz.title}
                                            </h3>
                                            <div className=" flex items-center gap-x-1">
                                                <Badge
                                                    className="bg-sky-500 hover:bg-sky-500"
                                                >
                                                    使用可能
                                                </Badge>
                                                {isLoading === quiz.id ? (
                                                    <div>
                                                        <Loader2 className=" animate-spin pl-1 w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger className=" focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 focus-visible:outline-none">
                                                            <div className=" cursor-pointer hover:opacity-75 transition">
                                                                <MoreVertical className=" w-4 h-4" />
                                                            </div>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent side="left" align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => window.location.href = `/dashboard/teams/${team.id}/settings/quizs/${quiz.id}`}
                                                                className=" items-center flex justify-start"
                                                            >
                                                                <FolderCog className=" h-4 w-4 mr-2" />
                                                                <p>
                                                                    詳細
                                                                </p>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className=" bg-primary/20" />
                                                            <DropdownMenuItem
                                                                onClick={() => onOpen("QuizModal", { quiz, isPreview: true })}
                                                                className=" items-center flex justify-start"
                                                            >
                                                                <PlayCircle className=" h-4 w-4 mr-2" />
                                                                <p>
                                                                    プレビュー
                                                                </p>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className=" bg-primary/20" />
                                                            <DropdownMenuItem
                                                                onClick={() => { onDeleteQuiz(quiz.id) }}
                                                                className=" text-rose-500 hover:text-rose-500 items-center flex justify-start"
                                                            >
                                                                <Trash className=" h-4 w-4 mr-2 text-rose-500 hover:text-rose-500" />
                                                                <p className="text-rose-500 hover:text-rose-500">
                                                                    削除
                                                                </p>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    <Separator />
                                </div>
                            )
                        })}
                        {unVerifiedQuizs.map((quiz) => {

                            return (
                                <div key={quiz.id}>
                                    <div className="py-3 w-full">

                                        <div className="flex justify-between items-center">
                                            <h3>
                                                {quiz.title}
                                            </h3>
                                            <div className=" flex items-center gap-x-1">
                                                <Badge>
                                                    使用できません
                                                </Badge>
                                                {isLoading === quiz.id ? (
                                                    <div>
                                                        <Loader2 className=" animate-spin pl-1 w-4 h-4" />
                                                    </div>
                                                ) : (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger className=" focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 focus-visible:outline-none">
                                                            <div className=" cursor-pointer hover:opacity-75 transition">
                                                                <MoreVertical className=" w-4 h-4" />
                                                            </div>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent side="left" align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => window.location.href = `/dashboard/teams/${team.id}/settings/quizs/${quiz.id}`}
                                                                className=" items-center flex justify-start"
                                                            >
                                                                <FolderCog className=" h-4 w-4 mr-2" />
                                                                <p>
                                                                    詳細
                                                                </p>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className=" bg-primary/20" />
                                                            <DropdownMenuItem
                                                                onClick={() => { onDeleteQuiz(quiz.id) }}
                                                                className=" text-rose-500 hover:text-rose-500 items-center flex justify-start"
                                                            >
                                                                <Trash className=" h-4 w-4 mr-2 text-rose-500 hover:text-rose-500" />
                                                                <p className="text-rose-500 hover:text-rose-500">
                                                                    削除
                                                                </p>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                )}
                                            </div>
                                        </div>

                                    </div>

                                    <Separator />
                                </div>
                            )
                        })}
                    </div >
                )}
            </div >

        </div >
    )

}