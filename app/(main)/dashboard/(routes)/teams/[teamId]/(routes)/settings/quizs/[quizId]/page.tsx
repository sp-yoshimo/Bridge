import { db } from "@/lib/db";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { QuizIdClient } from "./_components/quizid-client";

const QuizIdPage = async({
    params
}: {
    params: {
        teamId: string,
        quizId: string
    }
}) => {

    //クイズ, チーム, 現在のメンバーを取得
    
    const { userId } = auth();
    if(!userId){
        return redirectToSignIn();
    }

    const profile = await db.profile.findFirst({
        where:{
            userId
        }
    });
    if(!profile){
        return redirect("/setup")
    }

    const team = await db.team.findUnique({
        where:{
            id: params.teamId
        }
    });

    if(!team){
        return redirect(`/dashboard`)
    }

    const currentmember = await db.member.findFirst({
        where:{
            teamId: team.id
        }
    });

    if(!currentmember){
        return redirect("/dashboard")
    };

    if(currentmember.role === "STUDENT"){
        return redirect(`/dashboard/teams/${team.id}`)
    }


    //クイズを取得。問題はpositioの小さい順に並び替えて取得
    const quiz = await db.quiz.findUnique({
        where:{
            id: params.quizId,
        },
        include:{
            questions:{
                include:{
                    choices: {
                        orderBy:{
                            createdAt: "desc"
                        }
                    }
                },
                orderBy:{
                    position: "asc"
                }
            }
        }
    });

    if(!quiz){
        return redirect(`/dashboard/teams/${team.id}/settings`)
    }

    return (
        <div>
            <QuizIdClient 
                team={team}
                quiz={quiz}
            />
        </div>
    )
};

export default QuizIdPage;
