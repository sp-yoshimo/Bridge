import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { teamId: string, groupId: string } }
) {

    try {

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
        const currentmember = await db.member.findFirst({
            where: {
                teamId: params.teamId,
                profileId: profile.id
            }
        });

        if (!currentmember || currentmember.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };


        //グループ更新処理
        const {
            name,
            members
        } = await req.json();

        if (!name || !members) {
            return new NextResponse("Missing required field", { status: 401 })
        }

        //名前を更新
        const group = await db.group.update({
            where: {
                id: params.groupId
            },
            data: {
                name: name,
            }
        });

        if (!group) {
            return new NextResponse("Group not found", { status: 404 })
        };

        //一回すべてのメンバーをグループから削除
        await db.member.updateMany({
            where: {
                teamId: params.teamId,
                groupId: group.id
            },
            data: {
                isGrouped: false,
                groupId: null
            }
        })

        //メンバー更新
        for (const one_member of members) {

            const member = await db.member.findUnique({
                where: {
                    id: one_member.value
                },
            });

            if (!member) {
                return new NextResponse("Member not found", { status: 404 })
            };


            await db.group.update({
                where: {
                    id: params.groupId
                },
                data: {
                    members: {
                        connect: {
                            id: member.id
                        }
                    }
                }
            });

            //isGroupedをtrueに
            await db.member.update({
                where: {
                    id: member.id
                },
                data: {
                    isGrouped: true
                }
            })

        };


        const updatedGroup = await db.group.findUnique({
            where: {
                id: params.groupId
            }
        })

        return NextResponse.json(updatedGroup);

    } catch (error) {
        console.log("[GROUP_EDIT]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }

}



export async function DELETE(
    req: Request,
    { params }: { params: { teamId: string, groupId: string } }
) {

    try {

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
        const currentmember = await db.member.findFirst({
            where: {
                teamId: params.teamId,
                profileId: profile.id
            }
        });

        if (!currentmember || currentmember.role === "STUDENT") {
            return new NextResponse("Unauthorized", { status: 401 })
        };


        //グループ削除処理


        //一回すべてのメンバーをグループから削除
        await db.member.updateMany({
            where: {
                teamId: params.teamId,
                groupId: params.groupId
            },
            data: {
                isGrouped: false,
                groupId: null
            }
        })

        //グループを削除
        const deletedGroup = await db.group.delete({
            where: {
                id: params.groupId
            }
        })

        return NextResponse.json(deletedGroup);

    } catch (error) {
        console.log("[GROUP_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }

}