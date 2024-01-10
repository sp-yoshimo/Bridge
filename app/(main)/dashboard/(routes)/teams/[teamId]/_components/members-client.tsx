"use client"

import { Member, Profile } from "@prisma/client";
import { MembersList } from "./members-list";
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal";
import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";


export const MembersClient = ({
    members,
    profile
}: {
    members: (Member & {
        profile: Profile
    })[],
    profile: Profile
}) => {


    //teamIdを取得
    const params = useParams();
    const teamId = params.teamId as string;

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
            console.log(data);
        }


        const handleStartTeamOnline = () => {
            onOpen("startOnlineModal", { teamId })
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

    }, [teamId])

    //それぞれのロールのメンバーを取得
    const Admin = members.filter((member) => member.role === "ADMIN");
    const Teachers = members.filter((member) => member.role === "TEACHER" || member.role === "ADMIN");
    const Students = members.filter((member) => member.role === "STUDENT");


    return (
        <div className="flex flex-col mt-10 space-y-5">

            <div>
                <p className=" text-muted-foreground">
                    管理者
                </p>
                <MembersList
                    members={Admin}
                    currentProfileId={profile.id}
                />
            </div>

            <div>
                <p className=" text-muted-foreground">
                    先生
                </p>
                <MembersList
                    members={Teachers}
                    currentProfileId={profile.id}
                />
            </div>

            <div>
                <p className=" text-muted-foreground">
                    生徒
                </p>
                <MembersList
                    members={Students}
                    currentProfileId={profile.id}
                />
            </div>

        </div>
    )
}