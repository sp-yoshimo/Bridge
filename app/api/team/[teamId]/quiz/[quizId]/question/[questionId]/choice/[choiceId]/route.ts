import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server"

//問題の選択肢の更新処理
export async function PATCH(
    req: Request,
    { params }: {
        params: {
            teamId: string,
            quizId: string,
            questionId: string,
            choiceId: string
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

        //選択肢更新処理
        const {
            content,
            isCorrect
        } = await req.json();

        // 正解の選択肢が他にないか確認
        const question = await db.question.findUnique({
            where: {
                id: params.questionId
            },
            include: {
                choices: true
            }
        });

        if (!question) {
            return new NextResponse("Question not found", { status: 401 })
        }

        // 全ての選択肢をそれぞれ確認。
        const isNoneOtherCorrect = question.choices.every((choice) => !choice.isCorect);


        //もし他の選択肢で正解が選択されている尚且つ、リクエストを送った選択肢の更新にisCorecrをtrueが含まれていたらエラー
        if (!isNoneOtherCorrect && isCorrect) {
            return new NextResponse("他の選択肢で正解が選択されています", { status: 400 })
        };


        const updatedChoice = await db.choice.update({
            where: {
                id: params.choiceId
            },
            data: {
                content: content,
                isCorect: isCorrect
            }
        })

        //

        return NextResponse.json(updatedChoice)

    } catch (error) {
        console.log("[CHOICE_ID_EDIT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}


export async function DELETE(
    req: Request,
    { params }: {
        params: {
            teamId: string,
            quizId: string,
            questionId: string,
            choiceId: string
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

        //選択肢削除処理

        const deletedChoice = await db.choice.delete({
            where: {
                id: params.choiceId
            },
        })

        return NextResponse.json(deletedChoice)

    } catch (error) {
        console.log("[CHOICE_ID_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}