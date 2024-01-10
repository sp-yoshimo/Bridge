import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"

//問題の選択肢追加
export async function POST(
    req: Request,
    { params }: {
        params: {
            teamId: string,
            quizId: string,
            questionId: string
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
        }

        const currentmember = await db.member.findFirst({
            where: {
                teamId: params.teamId,
                profileId: profile.id
            }
        });

        if (!currentmember || currentmember.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };


        //選択肢作成処理
        const choice = await db.choice.create({
            data:{
                content: "",
                questionId: params.questionId
            }
        });

        return NextResponse.json(choice);

    } catch (error) {
        console.log("[CHOICE_CREATE]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}


//問題(question)の削除
export async function DELETE(
    req: Request,
    { params }: {
        params: {
            teamId: string,
            quizId: string,
            questionId: string
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
        }

        const currentmember = await db.member.findFirst({
            where: {
                teamId: params.teamId,
                profileId: profile.id
            }
        });

        if (!currentmember || currentmember.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };


        //問題削除処理
        const deletedQuestion = await db.question.delete({
            where: {
                id: params.questionId,
                quizId: params.quizId
            }
        });


        //削除後のクイズ内の問題達を取得
        const updaptedQuestions = await db.question.findMany({
            where: {
                quizId: params.quizId
            },
            orderBy: {
                position: "asc"
            }
        })

        //問題数の更新
        await db.quiz.update({
            where: {
                id: params.quizId
            },
            data: {
                number: updaptedQuestions.length
            }
        })

        return NextResponse.json(updaptedQuestions)

    } catch (error) {
        console.log("[QUESTION_ID_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}