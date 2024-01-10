import { db } from "@/lib/db";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { TeamOnlineClient } from "./_components/team-online-client";
import { Choice, Question, Quiz } from "@prisma/client";


//オンライン授業用のページ
const OnlinePage = async ({
    searchParams
}: {
    searchParams: {
        teamId: string
    }
}) => {

    //認証
    const { userId } = auth();
    if (!userId) {
        return redirectToSignIn()
    };

    const profile = await db.profile.findFirst({
        where: {
            userId: userId
        }
    });

    if (!profile) {
        return redirect("/setup")
    }

    //searchparamsかたチームを取得
    const team = await db.team.findFirst({
        where: {
            id: searchParams.teamId,
            members: {
                some: {
                    profileId: profile.id
                }
            }
        },
        include: {
            online: true,
            groups: true,
            members: {
                include: {
                    profile: true
                }
            },
            quizs: {
                include:{
                    questions:{
                        include:{
                            choices: true
                        }
                    }
                }
            }
        }
    });


    if (!team) {
        return redirect("/dashboard")
    }

    //もしonlineのstatusがnoneだったらオンライン授業は行われていないためreturn
    if (team.online === null || team.online?.status === "NONE") {
        return redirect(`/dashboard/teams/${team.id}`)
    };


    //現在のプロフィールを取得
    const currentMember = await db.member.findFirst({
        where: {
            teamId: team?.id,
            profileId: profile.id
        },
        include: {
            profile: true
        }
    });

    if (!currentMember) {
        return redirect("/")
    }


    //もしgroupモードだったらグループページへ移行
    if (team.online.status === "GROUP") {
        //先生だったら/online/group
        if (currentMember.role !== "STUDENT") {
            return redirect(`/online/group?teamId=${team.id}`)

        } else {

            //もし生徒がどこのグループにも属していない場合はグループモードに参加できないため、別ページに飛ばす

            if (currentMember.groupId) {
                return redirect(`/online/group/${currentMember.groupId}?teamId=${team.id}`)

            } else {
                return redirect(`/online/group?teamId=${team.id}`)
            }
        }
    }

    type QuizincludesChildren = Quiz & {
        questions: (Question & {
            choices: Choice[]
        })[]
    }

    //条件を満たしたクイズを習得
    let varifiedQuizs: QuizincludesChildren[] = []
    for (const quiz of team.quizs) {

        //まず問題が1問以上あるか
        if (quiz.questions.length === 0) {
            continue
        }

        //OKかどうかの判定用変数
        let flag = true

        //個々の問題のバリデーション
        for (const question of quiz.questions) {

            //問題文があるか
            if (!question.content) {
                flag = false
            }

            //選択肢が2つ以上あるか
            if (question.choices.length < 2) {
                flag = false
            }

            //それぞれの選択肢にちゃんと選択内容が書かれているか
            const allContent = question.choices.every((choice) => choice.content);

            if (!allContent) {
                flag = false
            }

            //正解の選択肢が1つあるか
            const correct = question.choices.find((choice) => choice.isCorect);

            if (!correct) {
                flag = false
            }
        }

        if (!flag) {
            continue
        }

        //条件を満たしたクイズを配列に収納
        varifiedQuizs.push(quiz)
    }

    return (
        <div className=" w-full h-full">
            <TeamOnlineClient
                team={team}
                currentmember={currentMember}
                quizs={varifiedQuizs}
            />
        </div>
    )
};

export default OnlinePage;
