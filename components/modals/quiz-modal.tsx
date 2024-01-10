"use client"

import { useModal } from "@/hooks/use-modal";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Choice, Question } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Circle, X } from "lucide-react";

export const QuizModal = () => {

    const { isOpen, onClose, type, data } = useModal();
    const isModalOpen = isOpen && type === "QuizModal";

    const { quiz, isPreview } = data;

    //問題を表示していく。そのために、現在自分がいるページを保持
    const [step, setStep] = useState(1);

    //フッターボタンのテキスト
    const [actionText, setActionText] = useState("始める");

    //ユーザーのクイズの結果を格納
    const [results, setResults] = useState<boolean[]>([]);

    //現在解いている問題の、questionオブジェクトを取得
    const [question, setQuestion] = useState<Question & { choices: Choice[] }>(quiz?.questions[0]!);

    //現在は解いているのか、それとも送信後、すなわち答えを見ている状態なのかを確認
    const [isSolving, setIsSolving] = useState(false);

    //ユーザーの選択した選択肢Id
    const [selectedChoiceId, setSelectedChoiceId] = useState("");

    //ユーザーの正誤
    const [isUserCorrect, setIsUserCorrect] = useState(false);

    //モーダルの最大ページ数を計算。
    //最初の1ページ + 問題1問につき2ページ(出題ページと結果ページ) + リザルト1ページ
    const MAX_PAGE = 1 + 2 * quiz?.number! + 1


    //初期化処理
    useEffect(() => {
        if (isModalOpen) {
            setResults([])
            setStep(1);
        }
    }, [isModalOpen])


    //現在解いている問題の配列のインデックスを取得する関数
    const onGetQuestionIndex = () => {

        let index;

        //現在のstep - 1の値を2で割る。step - 1が偶数の場合、割り切れた値 - 1がインデックス。step - 1が奇数の場合、割れた値 + 余り - 1がインデックス
        if ((step - 1) % 2 === 0) {
            index = ((step - 1) / 2) - 1
        } else {
            index = (Math.floor((step - 1) / 2)) + ((step - 1) % 2) - 1
        }

        return index

    }

    useEffect(() => {


        //フッターのボタンのテキストの更新,問題を解いているか、その他状態変数の更新
        if (step == 1) {

            setActionText("始める")

        } else if (step == 0) {

            setActionText("");

        } else if (step === MAX_PAGE) {

            setActionText("終了")

        } else if (step === MAX_PAGE - 1) {


            //回答を保存
            setResults(prevState => [...prevState, isUserCorrect])

            setIsSolving(false);
            setSelectedChoiceId("");
            setActionText("結果を見る")


        } else if (step % 2 == 0) {

            //偶数ページは必ず出題ページ
            setIsSolving(true);
            setActionText("確定")

        } else if (step % 2 == 1) {

            //回答を保存
            setResults(prevState => [...prevState, isUserCorrect])


            setIsSolving(false);
            setSelectedChoiceId("");
            setActionText("次の問題")

        }

        //現在解いているquestionオブジェクトの更新
        setQuestion(quiz?.questions[onGetQuestionIndex()]!)

    }, [step, MAX_PAGE, isUserCorrect, quiz?.questions])

    //次のページに進む処理
    const onNext = () => {
        setStep((current) => current += 1)
    }


    let bodyContent: React.ReactNode;

    if (step === 0) {
        bodyContent = (
            <></>
        )
    }

    //最初のページ
    if (step === 1) {
        bodyContent = (
            <div className="">

                <div className=" text-center">
                    <h3 className=" text-2xl ">
                        クイズを行います
                    </h3>
                    <p className=" mt-1 text-sm text-muted-foreground">
                        問題数 {quiz?.number}問
                    </p>
                </div>
                <div className=" relative w-[300px] h-[300px]">
                    <Image
                        src={`/images/drawkit/10.png`}
                        fill
                        alt="image"
                        className=" object-cover"
                    />
                </div>

            </div>
        )
    }

    //問題を解くページ
    if (1 < step && step < MAX_PAGE && question && isSolving) {
        bodyContent = (
            <ScrollArea className="w-full h-auto flex items-center">
                <div className=" px-6">

                    <div className="w-full flex items-center justify-start">
                        <p className=" text-sm text-muted-foreground">
                            {(onGetQuestionIndex() + 1).toString()}問目
                        </p>
                    </div>

                    {/* 問題文 */}
                    <div className=" mt-2">
                        <Card className="p-3 bg-secondary w-full">
                            <h3 className=" font-bold break-words">
                                {question.content}
                            </h3>
                        </Card>
                    </div>

                    <p className=" my-6 text-center text-muted-foreground">
                        正しい選択肢を選んでください
                    </p>

                    {/* 選択肢 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                        {question.choices.map((choice) => (
                            <Card
                                key={choice.id}
                                className={cn(
                                    ` p-3 hover:shadow-md cursor-pointer transition`,
                                    choice.id === selectedChoiceId && "border-sky-500 border-2"
                                )}
                                onClick={() => {
                                    setSelectedChoiceId(choice.id)
                                    if (choice.isCorect) {
                                        setIsUserCorrect(true);
                                    } else {
                                        setIsUserCorrect(false);
                                    }
                                }}
                            >
                                <p className=" w-full break-words">
                                    {choice.content}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            </ScrollArea>
        )
    }

    //問題の正誤確認ページ
    if (1 < step && step < MAX_PAGE && question && !isSolving) {
        bodyContent = (
            <ScrollArea className=" w-full h-auto flex items-center">
                <div className="px-6">

                    <div className={cn(
                        `my-6 w-full h-[50px] flex items-center justify-center rounded-lg`,
                        isUserCorrect ? "bg-sky-300/50" : "bg-rose-400/50"
                    )}>
                        <p>
                            {isUserCorrect ? "正解" : "不正解"}
                        </p>
                    </div>

                    <div className="flex items-center justify-start">
                        <p className=" text-sm text-muted-foreground">
                            {(onGetQuestionIndex() + 1).toString()}問目
                        </p>
                    </div>

                    {/* 問題文 */}
                    <div className=" mt-2">
                        <Card className="p-3 bg-secondary w-full">
                            <h3 className=" font-bold break-words">
                                {question.content}
                            </h3>
                        </Card>
                    </div>


                    {/* 選択肢 */}
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
                        {question.choices.map((choice) => (
                            <Card
                                key={choice.id}
                                className={cn(
                                    ` p-3`,
                                    choice.isCorect && "border-emerald-500 border-2"
                                )}
                            >
                                <div className=" w-full break-words flex justify-between items-center">
                                    <p>{choice.content}</p>
                                    {choice.isCorect && (
                                        <Badge className=" bg-emerald-500 hover:bg-emerald-500">
                                            正解の選択肢
                                        </Badge>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </ScrollArea>
        )
    }

    //最後のページ
    if (step === MAX_PAGE) {
        bodyContent = (
            <ScrollArea className="w-auto h-auto px-6 mx-auto">
                <div className=" flex flex-col">
                    <div>
                        <h3 className=" text-xl text-center">
                            結果
                        </h3>
                    </div>
                    <div className=" mt-4 flex flex-col sm:flex-row gap-3 flex-wrap">
                        {results.map((result, i) => (
                            <div key={i}>
                                <Card className=" p-3">
                                    <div className=" flex flex-col items-center">
                                        <p className=" text-xs text-muted-foreground mb-2">
                                            {(i + 1).toString()}問目
                                        </p>
                                        {result && (
                                            <Circle className=" text-rose-500 w-5 h-5 md:w-8 md:h-8" />
                                        )}
                                        {!result && (
                                            <X className=" text-sky-500 w-5 h-5 md:w-8 md:h-8" />
                                        )}
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollArea>
        )
    }

    return (
        <AlertDialog open={isModalOpen}>
            <AlertDialogContent className=" p-0">
                <AlertDialogHeader className=" pt-5 border-b pb-5">
                    <AlertDialogTitle className="text-2xl text-center font-bold">
                        {quiz?.title}
                    </AlertDialogTitle>
                </AlertDialogHeader>

                {/* クイズ表示 */}
                <div className="flex justify-center">
                    {bodyContent}
                </div>
                <AlertDialogFooter className=" p-5 border-t w-full">
                    <div className={`w-full flex  justify-${isPreview ? "between" : "end"} items-center`}>
                        {isPreview && (
                            <Button
                                variant={"ghost"}
                                onClick={() => {
                                    // モーダルを閉じる際の初期化処理

                                    onClose()
                                    setIsUserCorrect(false);
                                    setSelectedChoiceId("")
                                    setIsSolving(false)
                                    setResults([])
                                    setStep(0)
                                }}
                            >
                                キャンセル
                            </Button>
                        )}
                        {actionText && (
                            <Button
                                onClick={() => {
                                    if (step === MAX_PAGE) {
                                        // モーダルを閉じる際の初期化処理

                                        onClose();
                                        setIsUserCorrect(false);
                                        setSelectedChoiceId("")
                                        setIsSolving(false)
                                        setResults([])
                                        setStep(0)
                                    }
                                    else {
                                        onNext();
                                    }
                                }}
                                className=" bg-sky-500 hover:bg-sky-600 transition"
                                disabled={(isSolving && selectedChoiceId === "")}
                            >
                                {actionText}
                            </Button>
                        )}
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}