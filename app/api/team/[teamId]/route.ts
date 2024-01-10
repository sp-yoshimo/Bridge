import { TeamCard } from "@/components/team-card";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


//チーム削除処理
export async function DELETE(
    req: Request,
    { params }: { params: { teamId: string } }
) {
    try {

        //認証
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        };



        const profile = await db.profile.findUnique({
            where: {
                userId: userId
            }
        });

        if (!profile || !profile.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        };

        //メンバーを取得(現在の自分の)
        const curremtMember = await db.member.findFirst({
            where : {
                teamId: params.teamId,
                profileId: profile.id
            }
        });


        if(!curremtMember){
            return new NextResponse("Member not found",{ status: 404 })
        }

        //もしメンバーのロールがADMINではないならチーム削除は行えない
        if(curremtMember.role !== "ADMIN"){
            return new NextResponse("Unauthorized",{ status: 401 })
        };

        //チームの削除処理
        const deletedTeam = await db.team.delete({
            where:{
                id: params.teamId
            }
        })

        return NextResponse.json(deletedTeam)

    } catch (error) {
        console.log("[DELETE_TEAM]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { teamId: string } }
) {

    try {


        //認証処理
        const { userId } = auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const profile = await db.profile.findFirst({
            where: {
                userId: userId
            }
        });

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        };



        //そのチームに属しているか、そしてロールがADMINかTEACHERかを判定
        const member = await db.member.findFirst({
            where: {
                teamId: params.teamId,
                profileId: profile.id
            }
        });

        if (!member || member.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };

        const values = await req.json();


        const updatedTeam = await db.team.update({
            where: {
                id: params.teamId
            },
            data: {
                ...values
            },
            include: {
                members: true
            }
        })

        //もしチームの更新が行われたなら通知をメンバー全員に送る(変更者以外)
        if (values.notificate) {

            for (const team_member of updatedTeam.members) {

                //変更者本人には通知を送らない
                if (team_member.id === member.id) {
                    continue
                }

                await db.notification.create({
                    data: {
                        teamId: updatedTeam.id,
                        content: "お知らせが更新されました",
                        profileId: team_member.profileId,
                        href: `/dashboard/teams/${updatedTeam.id}`,
                        checked: false
                    }
                })

            }

        }

        return NextResponse.json(updatedTeam);



    } catch (error) {
        console.log("[UPDATE_TEAM]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }

}