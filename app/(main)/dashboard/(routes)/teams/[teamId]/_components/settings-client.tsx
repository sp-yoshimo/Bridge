"use client"

import { Member, Online } from "@prisma/client"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { TeamInfoSettings } from "./team-info-settings"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { GroupSettings } from "./group-settings"
import { OtherSettings } from "./other-settings"
import { useModal } from "@/hooks/use-modal"
import { useEffect } from "react"
import { pusherClient } from "@/lib/pusher"
import { QuizSettings } from "./quiz-settings"


export const SettingsClient = ({
    team,
    currentmember,
}: {
    team: any,
    currentmember: Member,
}) => {

    //Urlのクエリによって表示させる設定ページを分ける

    const searchParams = useSearchParams();
    let queryMode = searchParams.get("mode")

    const router = useRouter();
    const pathname = usePathname()

    if (!queryMode) {
        queryMode = "information"
    }

    if (queryMode !== "information" && queryMode !== "group" && queryMode !== "other" && queryMode !== "quiz") {
        queryMode = "information"
    }

    //設定ページs
    const settinRoutes = [
        {
            label: "チーム情報の設定",
            mode: "information",
            isActive: queryMode === "information"
        },
        {
            label: "グループの管理",
            mode: "group",
            isActive: queryMode === "group"
        },
        {
            label: "クイズの管理",
            mode: "quiz",
            isActive: queryMode === "quiz"
        },
        {
            label: "その他の設定",
            mode: "other",
            isActive: queryMode === "other"
        }
    ]



    //teamIdを取得
    const params = useParams();
    const teamId = params.teamId as string;

    const { onOpen } = useModal();

    useEffect(() => {

        pusherClient.subscribe(teamId)


        //リアルタイムにメンバー追加
        const handleNewMember = (data: any) => {
            // 新しいメンバーがどこのグループにも属していないのでグループの使用を中止したというモーダルを表示

            if (data.isvalid && currentmember.role != "STUDENT") {
                onOpen("groupErrorModal", { teamId })
            }
            router.refresh();
        }


        //リアルタイムにメンバー脱退
        const handleLeaveMember = (data: any) => {
            if (data.isvalid && currentmember.role != "STUDENT") {
                // グループに問題が生じたため、グループの使用中止をしたというモーダルを表示
                onOpen("groupErrorModal", { teamId })
            }
            router.refresh();
        }

        const handleStartTeamOnline = (data: Online) => {
            router.refresh();

            if (data.authorId != currentmember.id) {
                onOpen("startOnlineModal", { teamId })
            }

        }


        pusherClient.bind("member:new", handleNewMember);
        pusherClient.bind("member:leave", handleLeaveMember);
        pusherClient.bind("online:team", handleStartTeamOnline);


        return () => {
            pusherClient.unsubscribe(teamId);
            pusherClient.unbind("member:new", handleNewMember);
            pusherClient.unbind("member:leave", handleLeaveMember);
            pusherClient.unbind("online:team", handleStartTeamOnline)
        }

    }, [teamId, currentmember, currentmember.role, onOpen, router])


    return (
        <div className=" flex gap-x-10">
            <div className=" py-3 pt-5 hidden md:block w-[200px] space-y-5">
                {settinRoutes.map((item) => (
                    <div
                        key={item.mode}
                        className=" cursor-pointer"
                        onClick={() => router.push(pathname + `?mode=${item.mode}`)}
                    >
                        <p className={cn(
                            `text-zinc-600 dark:text-zinc-400`,
                            item.isActive && "font-bold text-black dark:text-white"
                        )}>
                            {item.label}
                        </p>
                    </div>
                ))}
            </div>

            <Separator
                orientation="vertical"
                className=" h-auto hidden md:block"
            />

            <div className=" w-full">
                {queryMode === "information" && (
                    <div className=" w-full">
                        <TeamInfoSettings team={team} />
                    </div>
                )}
                {queryMode === "group" && (
                    <div>
                        <GroupSettings team={team} member={currentmember} />
                    </div>
                )}
                {queryMode === "quiz" && (
                    <div>
                        <QuizSettings team={team} member={currentmember} />
                    </div>
                )}
                {queryMode === "other" && (
                    <div>
                        <OtherSettings team={team} member={currentmember} />
                    </div>
                )}
            </div>
        </div>
    )
}