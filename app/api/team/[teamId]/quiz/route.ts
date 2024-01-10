import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
    req: Request,
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

        //クイズ作成を行えるのはそのチームに所属しているユーザー
        const team = await db.team.findFirst({
            where: {
                id: params.teamId,
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
        });

        if (!team) {
            return new NextResponse("Team not found", { status: 404 })
        };


        //クイズ作成を行えるのはroleがADMINもしくはteacherのみ
        const member = await db.member.findFirst({
            where: {
                teamId: team.id,
                profileId: profile.id
            }
        });

        if (!member || member.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };



        //クイズ作成処理
        const {
            title
        } = await req.json();

        if (!title) {
            return new NextResponse("Invalid required field", { status: 400 })
        };

        const quiz = await db.quiz.create({
            data:{
                title: title,
                teamId: team.id,
                number: 0
            }
        });

        return NextResponse.json(quiz);


    } catch (error) {
        console.log("[QUIZ_CREATE]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}