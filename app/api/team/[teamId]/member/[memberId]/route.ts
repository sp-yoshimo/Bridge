import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: { teamId: string, memberId: string } }
) {
    try {


        //メンバーがチームを抜けるには以下のバリデーションを通る必要がある
        //1.ログインしているか,プロフィールが存在しているか
        //2.チームid, メンバーidがparamsから取得できているか
        //3.メンバーがチームに入っているか

        //1
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

        //2
        if (!params.teamId || !params.memberId) {
            return new NextResponse("Missing required ID", { status: 401 })
        }


        //3
        const member = await db.member.findFirst({
            where: {
                teamId: params.teamId,
                profileId: profile.id
            },
            include: {
                profile: true
            }
        });

        if (!member) {
            return new NextResponse("Unauthorized", { status: 401 })
        };


        if (member.groupId) {

            //もしグループにも所属していたら、グループも抜ける
            await db.member.update({
                where: {
                    id: member.id
                },
                data: {
                    isGrouped: false,
                    groupId: null
                }
            })

            //メンバーの削除
            await db.member.delete({
                where: {
                    id: params.memberId,
                    teamId: params.teamId
                },
                include: {
                    profile: true
                }
            });

        } else {

            //メンバーの削除
            await db.member.delete({
                where: {
                    id: params.memberId,
                    teamId: params.teamId
                },
                include: {
                    profile: true
                }
            });
        }

        //メンバーが消えたことによってグループ使用の条件が崩壊していないかを確認する
        //例として、元から二人だったグループが、1人消えたことによって条件を満たさないということがある
        const groups = await db.group.findMany({
            where: {
                teamId: params.teamId
            },
            include: {
                members: true
            }
        });

        //invalidがtrueならグループの変更の必要があり。
        let isvalid = false


        //人数が2人未満のグループができてしまったらクライアントに注意を送る
        for (const group of groups) {
            if (group.members.length < 2) {
                isvalid = true
            }
        }


        //そもそもチームがグループを使用していなかったらisvalidをfalseに
        const team = await db.team.findUnique({
            where: {
                id: params.teamId
            },
            include:{
                members: true
            }
        });

        if (!team?.isPublishedGroup) {
            isvalid = false
        }

        //もし問題ありならとりあえずグループの使用を中止
        if (isvalid) {
            await db.team.update({
                where: {
                    id: params.teamId
                },
                data: {
                    isPublishedGroup: false
                }
            })
        }

        if(!team?.members){
            return new NextResponse("members not found",{ status: 404 })
        }

        //先生に通知を送信する
        for(const team_member of team?.members){

            //生徒には通知は送らない
            if(team_member.role === "STUDENT"){
                continue
            }

            await db.notification.create({
                data:{
                    teamId: team.id,
                    profileId: team_member.profileId,
                    content: `生徒の${profile.name}さんがチームを脱退しました`,
                    checked: false
                }
            })

        }


        //pusherでリアルタイムにクライアントに送信(グループの条件の崩壊を防ぐ)
        await pusherServer.trigger(params.teamId, "member:leave", { member, isvalid });

        return NextResponse.json(member);


    } catch (error) {
        console.log("[MEBER_DELETE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}