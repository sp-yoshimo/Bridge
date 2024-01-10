import { db } from "@/lib/db";
import React from "react";
import { redirect } from "next/navigation";
import { TopClient } from "../../_components/top-client";
import { auth, redirectToSignIn } from "@clerk/nextjs";

const TeamIdTopPage = async ({
    params
}: {
    params: {
        teamId: string
    }
}) => {


    //未ログイン or 初期設定が完了していない場合はリダイレクト
    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const profile = await db.profile.findUnique({
        where: {
            userId: userId
        }
    });

    if (!profile) {
        return redirect("/setup")
    };

    const online = await db.online.findFirst({
        where: {
            teamId: params.teamId
        }
    });

    const member = await db.member.findFirst({
        where:{
            teamId: params.teamId,
            profileId: profile.id
        }
    });


    //現在いるチームを取得
    const team = await db.team.findUnique({
        where:{
            id: params.teamId
        }
    })

    if(!member || !team || !online){
        return redirect("/dashboard")
    }


    return (
        <div className="p-5">
            <div className=" flex flex-col mt-5">
                <TopClient
                    online={online}
                    profile={profile}
                    member={member}
                    team={team}
                />
            </div>
        </div>
    )
};

export default TeamIdTopPage;
