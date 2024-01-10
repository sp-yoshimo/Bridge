import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { auth } from "@clerk/nextjs";
import { OnlineStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    req: NextRequest,
    { params }: { params: { teamId: string } }
) {
    try {

        //認証
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        };

        const profile = await db.profile.findFirst({
            where: {
                userId: userId
            }
        });


        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        };

        //オンライン作成を行えるのはそのチームに所属しているユーザー
        const team = await db.team.findFirst({
            where: {
                id: params.teamId,
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            include: {
                members: true
            }
        });

        if (!team) {
            return new NextResponse("Team not found", { status: 404 })
        };

        //オンライン作成を行えるのはroleがADMINもしくはteacherのみ
        const member = await db.member.findFirst({
            where: {
                teamId: team.id,
                profileId: profile.id
            }
        });

        if (!member || member.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };



        //statusを取得
        const status = req.nextUrl.searchParams.get("status");

        if (!status) {
            return new NextResponse("Missing required field", { status: 404 })
        };

        //onlineのstatusをアップデート
        const updatedOnline = await db.online.update({
            where: {
                teamId: team.id
            },
            data: {
                status: status as OnlineStatus,
                authorId: member.id
            },
        });


        //クライアントにリアルタイムにデータを送信
        if (updatedOnline.status === "TEAM") {

            //通知を作成(チーム内のメンバー全員に)
            for (const team_member of team.members) {

                if(team_member.id === updatedOnline.authorId){
                    continue
                }

                await db.notification.create({
                    data: {
                        teamId: team.id,
                        checked: false,
                        content: `オンライン授業が始まりました`,
                        href: `/dashboard/teams/${team.id}`,
                        profileId: team_member.profileId
                    }
                })

            }


            pusherServer.trigger(team.id, "online:team", updatedOnline);
        }

        if (updatedOnline.status === "NONE") {
            pusherServer.trigger(team.id, "online:none", updatedOnline);
        }

        if (updatedOnline.status === "GROUP") {
            pusherServer.trigger(team.id, "online:group", updatedOnline);
        }

        //オンライン専用のURLへ飛ばす
        return NextResponse.json({ url: `/online?teamId=${team.id}` })


    } catch (error) {
        console.log("[TEAMID_ONLINE]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}