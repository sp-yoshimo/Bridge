"use client"

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/utils";
import { Member, Online, OnlineStatus, Team } from "@prisma/client"
import axios from "axios";
import { Loader2, LogOut, Plus } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";


interface TeamNavberProps {
    member: Member;
    team: Team & {
        online: Online | null;
    }
}

//生徒側のteamNavbarのルーティングはトップとメンバー
//先生側のteamNavbarのルーティングはトップとメンバーと設定
//先生(roleがADMIN or TEACHER)の時、オンライン授業を始めるボタンを押せる

export const TeamNavber = ({
    member,
    team
}: TeamNavberProps) => {

    const pathname = usePathname();
    const router = useRouter();

    const { onOpen } = useModal()
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);

    const imageUrl = team.imageUrl ? team.imageUrl : "/images/default-team-img.jpg"
    let status = "NONE";
    if (team.online?.status) {
        status = team.online.status;
    }


    const StudentsRoutes = [
        {
            label: "トップ",
            href: `/dashboard/teams/${team.id}`,
            isActive: pathname.endsWith(`/dashboard/teams/${team.id}`)

        },
        {
            label: "メンバー",
            href: `/dashboard/teams/${team.id}/members`,
            isActive: pathname.includes(`/dashboard/teams/${team.id}/members`)
        }
    ]

    const TeachersRoutes = [
        {
            label: "トップ",
            href: `/dashboard/teams/${team.id}`,
            isActive: pathname.endsWith(`/dashboard/teams/${team.id}`)

        },
        {
            label: "メンバー",
            href: `/dashboard/teams/${team.id}/members`,
            isActive: pathname.includes(`/dashboard/teams/${team.id}/members`)
        },
        {
            label: "チーム設定",
            href: `/dashboard/teams/${team.id}/settings`,
            isActive: pathname.includes(`/dashboard/teams/${team.id}/settings`)
        }
    ]

    //このチームの作成者もしくは先生ロールの人はisTeacherがtrue(ADMINは必然的に先生となる)
    const isTeacher = member.role === "TEACHER" || member.role === "ADMIN"

    //オンライン授業を始める処理
    const onStart = async () => {

        //1.オンライン授業を始めるボタンを押したらサーバーにリクエストを送ってonlineモデルをアップデート
        //2.サーバーから帰ってくるのはオンライン授業のurl
        //3.サーバー側でリアルタイムに通知を生徒&先生に送信

        try {

            setIsLoading(true);
            const response = await axios.post(`/api/team/${team.id}/online?status=TEAM`)

            toast({
                title: "オンライン授業を開始しました"
            });

            router.push(response.data.url)


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


    return (
        <div>
            <div className=" flex flex-col w-full h-full">

                <div className={cn(
                    `px-4 flex items-center justify-between`,
                )}>
                    <div className=" w-1/2 flex items-center gap-x-3">
                        <div className=" relative w-[150px] h-[150px] hidden md:block cursor-pointer" onClick={() => onOpen("expandImageModal", { imageUrl })}>
                            <Image
                                fill
                                className=" object-cover rounded-lg"
                                alt="team-img"
                                src={team.imageUrl ? team.imageUrl : "/images/default-team-img.jpg"}
                            />
                        </div>
                        <div>
                            <h1 className=" text-4xl font-bold">
                                {team.name}
                            </h1>
                            <p className="hidden md:block text-muted-foreground break-words truncate mt-1">
                                {team.description || ""}
                            </p>
                        </div>
                    </div>
                    <div className=" w-1/2 flex items-center justify-end">
                        {isTeacher && status == "NONE" && (
                            <Button
                                onClick={onStart}
                                disabled={isLoading}
                                className=" flex items-center gap-x-1 bg-sky-500 dark:bg-sky-600 hover:bg-sky-600 dark:hover:bg-sky-700 text-white" >
                                {isLoading ? (
                                    <>
                                        <Loader2 className=" h-3 w-3 md:w-5 md:h-5 animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        <Plus className=" h-3 w-3 md:w-5 md:h-5" />
                                    </>
                                )}
                                <p className="text-[15px] md:text-[20px]">
                                    オンライン授業を始める
                                </p>
                            </Button>
                        )}
                        {!isTeacher && (
                            <Button variant={"destructive"} onClick={() => onOpen("teamLeaveModal", { team, member })} className=" flex items-center gap-x-1  text-white" >
                                <LogOut className=" inline-block" />
                                <p className="hidden md:inline-block text-[20px]">
                                    チームを抜ける
                                </p>
                            </Button>
                        )}
                    </div>
                </div>


                <div className=" pt-1 max-w-4xl mx-auto w-full h-full">
                    <div className="  w-full flex justify-start items-end h-full">
                        {!isTeacher && (
                            <div className=" flex items-center justify-start">
                                {StudentsRoutes.map((route) => (
                                    <div
                                        key={route.label}
                                        className={cn(
                                            `px-8 cursor-pointer py-3 hover:opacity-70 transition`,
                                            route.isActive && " text-sky-500 hover:opacity-100"
                                        )}
                                        onClick={() => { router.push(route.href) }}
                                    >
                                        <p className=" text-sm md:text-base">
                                            {route.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {isTeacher && (
                            <ScrollArea className=" w-full">
                                <ScrollBar orientation="horizontal" />
                                <div className=" flex items-center justify-start">
                                    {TeachersRoutes.map((route) => (
                                        <div
                                            key={route.label}
                                            className={cn(
                                                `px-8 cursor-pointer py-3 hover:opacity-70 transition`,
                                                route.isActive && " text-sky-500 hover:opacity-100"
                                            )}
                                            onClick={() => { router.push(route.href) }}
                                        >
                                            <p className=" text-sm text-nowrap md:text-base">
                                                {route.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}

                    </div>
                </div>

            </div >
        </div>
    )
}