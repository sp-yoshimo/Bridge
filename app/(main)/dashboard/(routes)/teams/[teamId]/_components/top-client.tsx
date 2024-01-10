"use client"

import { Member, Online, Profile, Team } from "@prisma/client"
import { OnlineClassInfo } from "./online-class-info"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { pusherClient } from "@/lib/pusher"
import { useModal } from "@/hooks/use-modal"
import { TeamNotificate } from "./team-notificate"



//teamID/topのクライアントページ
export const TopClient = ({
    online,
    profile,
    member,
    team
}: {
    online: Online,
    profile: Profile,
    member: Member,
    team: Team
}) => {


    //teamIdを取得
    const params = useParams();
    const teamId = params.teamId as string;

    const [stateOnline, setStateOnline] = useState<Online>(online)

    const router = useRouter();

    const { onOpen } = useModal();

    useEffect(() => {

        pusherClient.subscribe(teamId)

        const handleNewMember = (data: any) => {
            // 新しいメンバーがどこのグループにも属していないのでグループの使用を中止したというモーダルを表示

            if (data.isvalid && profile.isTeacher) {
                onOpen("groupErrorModal", { teamId })
            }
        }

        const handleLeaveMember = (data: any) => {
            if (data.isvalid && profile.isTeacher) {
                // グループに問題が生じたため、グループの使用中止をしたというモーダルを表示
                onOpen("groupErrorModal", { teamId })
            }
        }


        const handleStartTeamOnline = (data: Online) => {
            setStateOnline(data);
            router.refresh();

            if (data.authorId != member.id) {
                onOpen("startOnlineModal", { teamId })
            }


        }

        //メンバー変更をリアルタイムに取得
        pusherClient.bind("member:new", handleNewMember);
        pusherClient.bind("member:leave", handleLeaveMember);

        //オンライン授業の開始をリアルタイムに取得
        pusherClient.bind("online:team", handleStartTeamOnline)

        return () => {
            pusherClient.unsubscribe(teamId);


            pusherClient.unbind("member:new", handleNewMember);
            pusherClient.unbind("member:leave", handleLeaveMember);

            pusherClient.unbind("online:team", handleStartTeamOnline)

        }

    }, [teamId])


    return (
        <div className=" flex flex-col space-y-10 pb-10">
            <TeamNotificate
                team={team}
                member={member}
            />
            <OnlineClassInfo
                online={stateOnline}
                member={member}
            />
        </div>
    )
}