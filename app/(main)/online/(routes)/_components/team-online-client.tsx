"use client"

import { Choice, Group, Member, Online, Profile, Question, Quiz, Team } from "@prisma/client"
import '@livekit/components-styles';
import {
    LiveKitRoom,
    VideoConference,
} from '@livekit/components-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { redirect, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { pusherClient } from "@/lib/pusher";
import { useModal } from "@/hooks/use-modal";
import { useTheme } from "next-themes";
import { FileQuestion, Loader2, Users } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TeamOnlineClientProps {
    team: Team & {
        members: (Member & {
            profile: Profile
        })[],
        online: Online | null,
        groups: Group[],
        quizs: Quiz[]
    },
    currentmember: Member & {
        profile: Profile
    },
    quizs: (Quiz & {
        questions: (Question & {
            choices: Choice[]
        })[]
    })[],
}


type QuizType = Quiz & {
    questions: (Question & {
        choices: Choice[]
    })[]
}

//クライアントからしかオンラインのtokenを取得できなさそうなのでとりあえずクライアントコンポーネントに移行
export const TeamOnlineClient = ({
    team,
    currentmember,
    quizs
}: TeamOnlineClientProps) => {


    const room = team.id as string;
    const name = currentmember.profile.name

    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { toast } = useToast();
    const { theme } = useTheme();
    const { onOpen } = useModal();



    const bgColor: string = useMemo(() => {

        if (theme === "light") {
            return "white"
        } else if (theme === "dark") {
            return "dark"
        } else {
            return "dark"
        }

    }, [theme])

    //オンライン授業のためのtokenを取得
    useEffect(() => {
        (async () => {
            try {
                const resp = await fetch(
                    `/api/livekit?room=${room}&username=${name}`
                );
                const data = await resp.json();
                setToken(data.token);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [name, room]);

    //オンライン授業の状態の変化をリアルタイムに取得
    useEffect(() => {

        pusherClient.subscribe(team.id)


        //オンライン授業終了をリアルタイムに検知
        const handleEndClass = (data: Online) => {
            if (data.authorId !== currentmember.id) {
                onOpen("endOnlineModal")
            }
        }

        //グループモードへの移行をリアルタイムに検知
        const handleMoveGroup = (data: Online) => {

            const teamId = team.id;
            const member = currentmember

            onOpen("startGroupModal", { teamId, member })

        }

        //クイズの開始をリアルタイムに検知
        const handleStartQuiz = (quiz: QuizType) => {

            //生徒にのみクイズを表示
            if (currentmember.role === "STUDENT") {
                onOpen("QuizModal", { quiz, isPreview: false })
            }
        }

        pusherClient.bind("online:none", handleEndClass);
        pusherClient.bind("online:group", handleMoveGroup);

        pusherClient.bind("quiz:start", handleStartQuiz);

        return () => {

            pusherClient.unbind("online:none", handleEndClass);
            pusherClient.unbind("online:group", handleMoveGroup);

            pusherClient.unbind("quiz:start", handleStartQuiz);

            pusherClient.unsubscribe(team.id)
        }

    }, [team.id, currentmember, onOpen])

    //team.onlineのnullの可能性をなくす
    if (!team.online) {
        return redirect(`/dashboard/teams/${team.id}`)
    }

    if (token === "") {
        return (
            <div className=" h-full w-full bg-white dark:bg-black flex items-center justify-center">
                <div className=" flex flex-col items-center">
                    <Loader2 className=" animate-spin w-10 h-10 mb-2" />
                    <p className=" text-xl">
                        準備中...
                    </p>
                </div>
            </div>
        )
    }

    //グループモードへの移行の処理
    const onGroupMode = async () => {

        try {
            setIsLoading(true);

            await axios.post(`/api/team/${team.id}/online?status=GROUP`);
            if (currentmember.role !== "STUDENT") {
                router.push(`/online/group?teamId=${team.id}`)
            } else {
                router.push(`/online/group/${currentmember.groupId}?teamId=${team.id}`)
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

    //クイズ開始
    const onStartQuiz = async (quizId: string) => {
        try {
            setIsLoading(true);

            await axios.post(`/api/team/${team.id}/online/quiz/${quizId}`);
            toast({
                title: "クイズを開始しました"
            })

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

    //オンライン授業退出・終了の処理
    const onDisconnect = async () => {
        try {

            setIsLoading(true)

            if (currentmember.role !== "STUDENT") {

                await axios.post(`/api/team/${team.id}/online?status=NONE`);
                toast({
                    title: "授業を終了しました",
                })
                router.push(`/dashboard/teams/${team.id}`)
                router.refresh()


            } else {
                router.push(`/dashboard/teams/${team.id}`)
                router.refresh()

            }

        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
            console.log("エラー")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <LiveKitRoom
            video={false}
            audio={false}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            style={{
                height: '100dvh',
                background: bgColor
            }}
        >

            <div className=" flex flex-col">

                {/* オンラインヘッダーコンポーネント */}
                <div className=" h-[80px] bg-slate-100 dark:bg-slate-950">
                    <div className="p-2 px-5 h-full flex justify-between items-center">
                        <div className=" w-1/3">
                            <h3 className=" text-2xl font-bold text-primary">
                                {team.name}
                            </h3>
                        </div>

                        <div className=" flex items-center gap-x-2">
                            {currentmember.role !== "STUDENT" && (
                                <div className=" flex items-center gap-x-2">
                                    <div className=" flex items-center">
                                        {!team.isPublishedGroup && (
                                            <p className=" text-muted-foreground text-xs mr-2 hidden md:block">
                                                グループの使用がOFFになっているため、グループモードを使えません。チーム設定/グループの管理でONにできます。
                                            </p>
                                        )}
                                        <Button
                                            onClick={onGroupMode}
                                            disabled={isLoading || !team.isPublishedGroup}
                                            className=" items-center flex gap-x-2"
                                        >
                                            <Users className=" w-5 h-5" />
                                            グループモード
                                        </Button>
                                    </div>


                                    {/* クイズを出すためのボタン */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button
                                                className=" items-center flex gap-x-2"
                                                disabled={isLoading}
                                            >
                                                <FileQuestion className="w-5 h-5" />
                                                クイズを出す
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {quizs.map((quiz, i) => (
                                                <>
                                                    <DropdownMenuItem
                                                        // クイズの開始ボタン
                                                        onClick={() => onStartQuiz(quiz.id)}
                                                        className=" font-bold cursor-pointer"
                                                    >
                                                        {quiz.title}
                                                    </DropdownMenuItem>
                                                    {i + 1 !== quizs.length && (
                                                        <DropdownMenuSeparator />
                                                    )}
                                                </>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                            )}
                            <div>
                                <Button
                                    onClick={onDisconnect}
                                    disabled={isLoading}
                                    className=" bg-red-600 hover:bg-red-600 hover:opacity-75 transition text-white"
                                >
                                    <p>
                                        {currentmember.role === "STUDENT" ? "授業を退出" : "授業を終了"}
                                    </p>
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* オンラインメインコンポーネント */}
                <div className=" h-[calc(100vh-80px)]">
                    <VideoConference />
                </div>

            </div>

        </LiveKitRoom>
    );
}
