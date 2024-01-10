import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

//クエスチョン作成
export async function POST(
    req: Request,
    { params }: { params: { teamId: string, quizId: string } }
) {
    try {

        //認証
        const { userId } = auth();
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

        const currentmember = await db.member.findFirst({
            where: {
                teamId: params.teamId,
                profileId: profile.id
            }
        });

        if (!currentmember || currentmember.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };


        //問題(クエスチョン)作成処理
        const {
            content,
            position
        } = await req.json();

        if (!position) {
            return new NextResponse("Missing required field", { status: 401 })
        }

        const currentQuiz = await db.quiz.findUnique({
            where: {
                id: params.quizId
            },
            include: {
                questions: true
            }
        });

        if (!currentQuiz) {
            return new NextResponse("Quiz not found", { status: 404 })
        }

        const question = await db.question.create({
            data: {
                quizId: currentQuiz.id,
                content: content || "",
                position: position
            }
        });

        if (!question) {
            return new NextResponse("Internal Error", { status: 500 })
        };

        // quizモデルの問題数をアップデート
        await db.quiz.update({
            where: {
                id: currentQuiz.id
            },
            data: {
                number: currentQuiz.questions.length + 1
            }
        })

        return NextResponse.json(question);

    } catch (error) {
        console.log("[QUESTION_CREATE]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}



//クエスチョンアップデート
export async function PATCH(
    req: Request,
    { params }: { params: { teamId: string, quizId: string } }
) {
    try {

        //認証
        const { userId } = auth();
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

        const currentmember = await db.member.findFirst({
            where: {
                teamId: params.teamId,
                profileId: profile.id
            }
        });

        if (!currentmember || currentmember.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };

        //問題更新処理(クライアントが問題文更新リクエスト処理を送ったのか、選択肢作成リクエストを送ったのかを判定)
        const {
            content,
            choice,
            questionId
        } = await req.json()

        if (!questionId) {
            return new NextResponse("Question Id is required", { status: 401 })
        }

        if (content) {

            //問題文更新
            const question = await db.question.update({
                where: {
                    id: questionId,
                    quizId: params.quizId
                },
                data: {
                    content: content
                },
                include: {
                    choices: true
                }
            });

            return NextResponse.json(question)

        } else if (choice) {

            //選択肢の追加
            const updatedQuestion = await db.question.update({
                where: {
                    id: questionId,
                    quizId: params.quizId
                },
                data: {
                    choices: {
                        create: {
                            content: "",
                            isCorect: false,
                        }
                    }
                },
                include: {
                    choices: true
                }
            })

            return NextResponse.json(updatedQuestion);

        } else {
            return NextResponse.json({ message: "no actions" })
        }


    } catch (error) {
        console.log("[QUESTION_EDIT]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}



//クイズ削除
export async function DELETE(
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
        }

        const profile = await db.profile.findFirst({
            where: {
                userId: userId
            }
        });
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        };

        const currentmember = await db.member.findFirst({
            where: {
                teamId: params.teamId,
                profileId: profile.id
            }
        });

        if (!currentmember || currentmember.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };

        //削除処理
        const deletedQuiz = await db.quiz.delete({
            where: {
                id: params.quizId
            },
        })

        return NextResponse.json(deletedQuiz);



    } catch (error) {
        console.log("[QUESTION_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}