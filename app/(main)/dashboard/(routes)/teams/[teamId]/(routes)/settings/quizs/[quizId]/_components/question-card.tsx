"use client"

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Choice, Question } from "@prisma/client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export const QuestionCard = ({
    question,
    index
}: {
    question: Question & {
        choices: Choice[]
    },
    index: number
}) => {

    const pathname = usePathname();
    const router = useRouter();

    const searchParams = useSearchParams();

    //現在いる問題ページのidを取得
    const questionId = searchParams.get("questionId")

    //問題が使用可能かのバリデーションについて
    //1.問題文があるか
    //2.選択肢が1つ以上あるか
    //3,正解のの選択肢が1つあるか
    //4.すべての選択肢にちゃんと選択内容が与えられているか

    //1.問題文があるか
    const isExistingContent = question.content ? true : false

    //2.選択肢が1つ以上あるか
    const moreOneChoices = question.choices.length > 1;

    //3.正解の選択肢が1つ以上あるか
    let CorrectAnswerNum = 0;
    for (const choices of question.choices) {
        if (choices.isCorect) {
            CorrectAnswerNum += 1
        }
    };
    const isOneCorrectAnswer = CorrectAnswerNum === 1;


    //4.すべての選択肢にちゃんと選択内容が与えられているか
    const isAllContent = question.choices.every((choice) => choice.content);

    //問題が使用可能か
    const canUse = isExistingContent && moreOneChoices && isOneCorrectAnswer && isAllContent

    return (
        <>
            <div>
                <div
                    className={cn(
                        `hover:bg-zinc-100 p-3 rounded-lg dark:hover:bg-slate-900 transition cursor-pointer`,
                        questionId === question.id && "bg-zinc-100 dark:bg-slate-900"
                    )}
                    onClick={() => {
                        router.push(pathname + `?questionId=${question.id}`)
                        router.refresh();
                    }}
                >
                    <div className=" flex justify-between items-center">
                        <p>
                            {index.toString()}問目
                        </p>
                        {canUse ? (
                            <Badge className=" bg-sky-500 hover:bg-sky-500">使用可能</Badge>
                        ) : (
                            <Badge className=" bg-muted-foreground">使用不可</Badge>
                        )}
                    </div>
                </div>

            </div>
            <Separator />
        </>
    )
}