"use client"

import { Separator } from "@/components/ui/separator"
import { Choice, Question, Quiz, Team } from "@prisma/client"
import { ArrowLeft, Folder } from "lucide-react"
import { useRouter } from "next/navigation"
import QuestionCreate from "./question-create"
import ChoiceCreate from "./choice-create"

interface QuizIdClientProps {
    team: Team,
    quiz: Quiz & {
        questions: (Question & {
            choices: Choice[]
        })[]
    }
}

export const QuizIdClient = ({
    team,
    quiz
}: QuizIdClientProps) => {

    const router = useRouter();

    return (
        <div className="w-full p-4">

            {/* ヘッダー */}
            <div className=" w-full">
                <div
                    onClick={() => {
                        router.push(`/dashboard/teams/${team.id}/settings?mode=quiz`)
                        router.refresh();
                    }}
                    className=" text-muted-foreground flex items-center gap-x-1 hover:opacity-75 transition cursor-pointer"
                >
                    <ArrowLeft />
                    <p>
                        戻る
                    </p>
                </div>
                <div className=" mt-8 flex items-end justify-between">
                    <h3 className=" text-2xl font-bold">
                        {quiz.title}
                    </h3>
                    <div className=" flex items-center gap-x-1">
                        <Folder />
                        <p>
                            {quiz.number}
                        </p>
                    </div>
                </div>
                {quiz.number !== 0 && (
                    <div className=" mt-2">
                        <p className="text-xs md:text-sm text-muted-foreground">
                            もし問題が使用可能にならない場合、その問題に問題文と選択肢があることを確認してください。また、それぞれの選択肢のどれかに正解の選択肢を入れる必要もあります
                        </p>
                    </div>
                )}
            </div>

            <Separator className=" mb-4 mt-1" />

            <div className=" w-full h-full">
                <div className=" w-full h-full block md:flex">

                    <div className="w-full md:w-1/3">
                        <QuestionCreate
                            team={team}
                            quiz={quiz}
                        />
                    </div>

                    <Separator
                        orientation="vertical"
                        className="h-auto min-h-[200px] hidden md:block"
                    />

                    <Separator
                        className=" block md:hidden my-3"
                    />

                    <div className="w-full md:w-2/3">
                        <ChoiceCreate
                            team={team}
                            quiz={quiz}
                        />
                    </div>

                </div>
            </div>

        </div>
    )
}