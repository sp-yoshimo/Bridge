import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs"
import { Member } from "@prisma/client";
import { NextResponse } from "next/server"

//グループ作成
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


        //グループ作成を行えるのはそのチームに所属しているユーザー
        const team = await db.team.findUnique({
            where: {
                id: params.teamId,
            },
        });


        if (!team) {
            return new NextResponse("Team not found", { status: 404 })
        };


        //グループ作成を行えるのはroleがADMINもしくはteacherのみ
        const member = await db.member.findFirst({
            where: {
                teamId: team.id,
                profileId: profile.id
            }
        });

        if (!member || member.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };



        //グループ作成処理
        const {
            name,
            members
        } = await req.json();

        if (!name || !members || members.length < 2) {
            return new NextResponse("Invalid required field", { status: 400 })
        };


        //まずgroupモデルを作成。memberIdsをforで回して、groupをupdate

        const group = await db.group.create({
            data: {
                name: name,
                teamId: team.id
            }
        });


        if (!group) {
            return new NextResponse("Internal Error", { status: 500 })
        }


        for (const groupMember of members) {

            if (!groupMember.value) {
                return new NextResponse("Invalid data", { status: 404 })
            }

            //まだグループに所属していないかを確認
            const one_member = await db.member.findUnique({
                where: {
                    id: groupMember.value,
                    isGrouped: false
                }
            });

            if (!one_member) {
                return new NextResponse("Member not found", { status: 404 })
            }

            //groupにメンバーを追加
            await db.group.update({
                where: {
                    id: group.id,
                },
                data: {
                    members: {
                        connect: {
                            id: one_member.id
                        }
                    }
                }
            })

            //メンバーのisGroupedをtrueに
            await db.member.update({
                where: {
                    id: groupMember.value
                },
                data: {
                    isGrouped: true
                }
            })

        };

        const updatedGroup = await db.group.findUnique({
            where: {
                id: group.id
            }
        });

        return NextResponse.json(updatedGroup)


    } catch (error) {
        console.log("[GROUP_CREATE_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}