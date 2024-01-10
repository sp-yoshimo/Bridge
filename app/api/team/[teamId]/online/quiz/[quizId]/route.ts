import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";


//クイズの開始をオンライン授業に参加しているメンバーに通知
export async function POST(
    req: Request,
    { params }: {
        params: {
            teamId: string,
            quizId: string
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
        });

        if (!team) {
            return new NextResponse("Team not found", { status: 404 })
        };

        //クイズの開始を行えるのはroleがADMINもしくはteacherのみ
        const member = await db.member.findFirst({
            where: {
                teamId: team.id,
                profileId: profile.id
            }
        });

        if (!member || member.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };


        //クイズを取得
        const quiz = await db.quiz.findUnique({
            where: {
                id: params.quizId
            },
            include: {
                questions: {
                    include: {
                        choices: true
                    }
                }
            }
        });

        if (!quiz) {
            return new NextResponse("Quiz not found", { status: 404 })
        };

        //pusherでオンラインにいるユーザーに通知
        pusherServer.trigger(team.id, "quiz:start", quiz);

        return NextResponse.json(quiz);


    } catch (error) {
        console.log("[QUIZ_START]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}