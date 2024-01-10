import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function POST(
    req: Request
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

        //チームへの参加
        const {
            code
        } = await req.json();

        if (!code) {
            return new NextResponse("Missing required Field", { status: 401 })
        };

        //teamが存在するか
        const team = await db.team.findFirst({
            where: {
                inviteCode: code
            },
            include:{
                members: true
            }
        });

        if (!team) {
            return new NextResponse("参加コードが間違っています", { status: 401 })
        }

        const isAdmin = await db.team.findFirst({
            where: {
                inviteCode: code,
                authorId: profile.id
            }
        });

        const isAlreadyMember = await db.member.findFirst({
            where: {
                profileId: profile.id,
                teamId: team.id
            }
        })


        //既にそのチームの管理人もしくメンはバーなら戻る
        if (isAdmin || isAlreadyMember) {
            return new NextResponse("既にそのチームに参加しています", { status: 404 })
        }

        const member = await db.member.create({
            data: {
                profileId: profile.id,
                teamId: team.id,
                role: profile.isTeacher ? "TEACHER" : "STUDENT"
            },
            include: {
                profile: true
            }
        });

        if (!member) {
            return new NextResponse("Internal Error", { status: 500 })
        }


        //新メンバーの加入によりグループの使用を中止
        await db.team.update({
            where: {
                id: team.id
            },
            data: {
                isPublishedGroup: false
            }
        })

        let isvalid = true;

        //そもそもチームがグループを使用していなかったらisvalidをfalseに
        if (!team?.isPublishedGroup) {
            isvalid = false
        }


        //先生に通知を送信する
        for (const team_member of team?.members) {

            //生徒には通知は送らない
            if (team_member.role === "STUDENT") {
                continue
            }

            //参加の通知を送信
            await db.notification.create({
                data: {
                    teamId: team.id,
                    profileId: team_member.profileId,
                    content: `${profile.isTeacher ? "先生の" : "生徒の"}の${profile.name}さんがチームに参加しました`,
                    checked: false
                }
            })

        }

        //pusherでリアルタイムにクライアントに送信(グループの条件の崩壊を防ぐ)
        await pusherServer.trigger(team.id, "member:new", { member, isvalid });



        return NextResponse.json(team);

    } catch (error) {
        console.log("[TEAM_CREATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}


