"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useModal } from "@/hooks/use-modal"
import { pusherClient } from "@/lib/pusher"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import '@livekit/components-styles';
import { Group, Member, Online, Profile, Team } from "@prisma/client"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useTheme } from "next-themes"
import { redirect, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"


//urlにgroupIdを含むかを検証。もし含んでいたら生徒(グループのオンラインページを表示)
//groupIDをふくんでいなかったら、先生 or グループに所属していない生徒が確定する
export const GroupOnlineCient = ({
    currentmember,
    team,
    group,
}: {
    team: Team & {
        members: (Member & {
            profile: Profile
        })[],
        online: Online | null,
    },
    currentmember: Member & {
        profile: Profile
    },
    group?: Group | null,
}) => {


    //team.onlineのnullの可能性をなくす
    if (!team.online) {
        return redirect(`/dashboard/teams/${team.id}`)
    }


    const room = group?.id as string;
    const name = currentmember.profile.name

    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isMounted, setIsMounted] = useState(false)

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

    useEffect(() => {
        setIsMounted(true)
    }, [])

    //オンライン授業のためのtokenを取得
    useEffect(() => {
        if (currentmember.groupId && currentmember.role === "STUDENT") {
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
        }
    }, [currentmember.groupId, currentmember.role]);

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
        const handleMoveTeam = (data: Online) => {

            const teamId = team.id;

            onOpen("startTeamModal", { teamId })

        }


        //先生からのメッセージをリアルタイムに表示
        const handleViewMessage = (message: string) => {

            if (currentmember.role === "STUDENT") {
                onOpen("groupMessage", { message: message })
            }

        }

        pusherClient.bind("online:none", handleEndClass);
        pusherClient.bind("online:team", handleMoveTeam)
        pusherClient.bind("message:new", handleViewMessage)

        return () => {

            pusherClient.unbind("online:none", handleEndClass);
            pusherClient.unbind("online:team", handleMoveTeam);
            pusherClient.unbind("message:new", handleViewMessage)

            pusherClient.unsubscribe(team.id)
        }

    }, [team.id])


    //チームモードへの移行の処理
    const onTeamMode = async () => {

        try {
            setIsLoading(true);

            await axios.post(`/api/team/${team.id}/online?status=TEAM`);
            toast({
                title: "チームモードへ移行します",
            })
            if (currentmember.role !== "STUDENT") {
                router.push(`/online?teamId=${team.id}`)
            } else {
                router.push(`/online?teamId=${team.id}`)
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
                router.refresh()
                router.push(`/dashboard/teams/${team.id}`)

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


    //生徒にメッセージを送信
    const onMessage = async () => {

        try {

            setIsLoading(true);
            await axios.post(`/api/team/${team.id}/online/message`, {
                message: message
            });


            toast({
                title: "メッセージを送信しました"
            })

            setMessage("")
            router.refresh()


        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
            console.log(error);
        } finally {
            setIsLoading(false);
        }

    }

    if (!isMounted) {
        return null
    }

    if (token === "" && currentmember.role === "STUDENT") {
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

    if (currentmember.role === "STUDENT" && group) {
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

                    <div className=" h-[80px] bg-slate-100 dark:bg-slate-950">
                        <div className="p-2 px-5 h-full flex justify-between items-center">
                            <div className=" flex items-center gap-x-2">
                                <h3 className=" text-2xl font-bold text-primary">
                                    {team.name}
                                </h3>
                                <Separator
                                    orientation="vertical"
                                    className=" h-[40px] w-[1px] bg-muted-foreground"
                                />
                                <h3 className=" text-xl text-primary">
                                    {group.name}
                                </h3>
                            </div>

                            <div className=" flex items-center">
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

            </LiveKitRoom >
        );
    } else {
        return (
            <div className=" h-full w-full">

                {/* グループモードのときの先生側の画面 */}
                {currentmember.role !== "STUDENT" && (
                    <div>
                        <div className=" flex flex-col">

                            {/* ヘッダーコンポーネント */}
                            <div className=" h-[80px] bg-slate-100 dark:bg-slate-950">
                                <div className="p-2 px-5 h-full flex justify-between items-center">
                                    <div className=" flex items-center gap-x-2">
                                        <h3 className=" text-2xl font-bold text-primary">
                                            {team.name}
                                        </h3>
                                        <Separator
                                            orientation="vertical"
                                            className=" h-[40px] w-[1px] bg-muted-foreground"
                                        />
                                        <h3 className=" text-xl text-primary">
                                            グループモード
                                        </h3>
                                    </div>

                                    <div className=" flex items-center gap-x-2">
                                        <Button
                                            onClick={onTeamMode}
                                            disabled={isLoading}
                                        >
                                            チームモード
                                        </Button>
                                        <Button
                                            onClick={onDisconnect}
                                            disabled={isLoading}
                                            className=" bg-red-600 hover:bg-red-600 hover:opacity-75 transition text-white"
                                        >
                                            <p>
                                                授業を終了
                                            </p>
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className=" h-[calc(100vh-80px)] flex items-center justify-center p-2">
                            <div>
                                <p className=" text-center font-bold text-xl">
                                    現在はグループモードです。チームモードに戻す際は上部のボタンをクリックしてください。
                                </p>
                                <div className=" mt-20">
                                    <p className=" text-center mb-2 font-bold">
                                        各グループにメッセージを送信する
                                    </p>
                                    <div className="">
                                        <Textarea
                                            rows={5}
                                            className="focus-visible:ring-sky-500 focus-visible:ring-offset-0 resize-none"
                                            placeholder="送信内容を書いてください"
                                            onChange={(e) => { setMessage(e.target.value) }}
                                            value={message}
                                        />
                                        <div className=" flex justify-end mt-3">
                                            <Button
                                                className="bg-sky-500 hover:bg-sky-500 hover:opacity-75"
                                                disabled={isLoading || message === ""}
                                                onClick={onMessage}
                                            >
                                                送信
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 生徒ロールなのに自分の所属グループがない場合にレンダリングするやつ */}
                {currentmember.role === "STUDENT" && (
                    <div className=" h-full w-full flex items-center justify-center px-1 md:px-5 lg:px-10">
                        <p className=" text-center font-bold text-xl">
                            現在はグループモードです。しかし、あなたはどこのグループにも属していないユーザーであるためグループに参加できません。
                            グループモードが終わるまで待機してください。
                        </p>
                    </div>
                )}
            </div>
        )
    }

}