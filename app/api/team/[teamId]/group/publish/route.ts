import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: {
        params: {
            teamId: string
        }
    }
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

        //publishがtrueならグループを使用、falseなら使用中止
        const { publish } = await req.json();

        //更新
        const team = await db.team.update({
            where: {
                id: params.teamId
            },
            data: {
                isPublishedGroup: publish
            }
        });

        if (!team) {
            return new NextResponse("Internal Error", { status: 500 })
        }

        return NextResponse.json(team);

    } catch (error) {
        console.log("[PUBLISH_GROUP]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}