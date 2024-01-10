import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
    { params }: {
        params: {
            teamId: string
        }
    }
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

        //メッセージを送信を行えるのはそのチームに所属しているユーザー
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
                members: true,
                groups: true
            }
        });

        if (!team) {
            return new NextResponse("Team not found", { status: 404 })
        };

        //メッセージ送信を行えるのはroleがADMINもしくはteacherのみ
        const member = await db.member.findFirst({
            where: {
                teamId: team.id,
                profileId: profile.id
            }
        });

        if (!member || member.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };


        const { message } = await req.json();

        //メッセージを各グループのユーザーに送信
        for (const group of team.groups) {

            pusherServer.trigger(team.id, "message:new", message);

        }

        return NextResponse.json({ message: message })


    } catch (error) {
        console.log("[ONLINE_MESSAGE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}