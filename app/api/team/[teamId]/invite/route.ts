import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"


export async function PATCH(
    req: Request,
    { params }: { params: { teamId: string } }
) {
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

    //招待コードの再生成
    const updatedTeam = await db.team.update({
        where: {
            id: params.teamId
        },
        data: {
            inviteCode: uuidv4()
        },
        include: {
            members: true
        }
    })



    return NextResponse.json(updatedTeam);
}