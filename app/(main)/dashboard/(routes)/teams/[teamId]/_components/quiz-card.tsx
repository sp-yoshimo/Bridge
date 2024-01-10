"use client"

import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useModal } from "@/hooks/use-modal";
import { QuizincludesChildren } from "@/types";
import { Team } from "@prisma/client";
import axios from "axios";
import { FolderCog, Loader2, MoreVertical, PlayCircle, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const QuizCard = ({
    quiz,
    team,
    canUse
}: {
    quiz: QuizincludesChildren,
    team: Team,
    canUse: boolean
}) => {

    const { onOpen } = useModal()
    const router = useRouter()
    const { toast } = useToast()

    const [isLoading, setIsLoading] = useState("");

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
        <div>
            <div className="py-3 w-full">

                <div className="flex justify-between items-center">
                    <h3>
                        {quiz.title}
                    </h3>
                    <div className=" flex items-center gap-x-1">
                        <Badge
                            className="bg-sky-500 hover:bg-sky-500"
                        >
                            {canUse ? "使用可能" : "使用できません"}
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
                                    {canUse && (
                                        <>
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
                                        </>
                                    )}
                                    {!canUse && (
                                        <>
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
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>

            </div>

            <Separator />
        </div>
    )
};

export default QuizCard;
