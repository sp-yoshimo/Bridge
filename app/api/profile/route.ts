import { db } from "@/lib/db";
import { auth, clerkClient, currentUser } from "@clerk/nextjs"
import { NextResponse } from "next/server"

export async function POST(
    req: Request,
) {
    try {

        //未ログインは弾く
        const user = await currentUser();

        if (!user || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        };


        //バリデーション通ってないリクエストも弾く
        const {
            name,
            imageUrl,
            isTeacher
        } = await req.json();

        if (!name || !imageUrl || isTeacher === null) {
            return new NextResponse("Missing required fields", { status: 401 })
        };

        //もし既にprofileがあったらそのままreturn
        const existingProfile = await db.profile.findUnique({
            where: {
                userId: user.id
            }
        });

        if (existingProfile) {
            return NextResponse.json(existingProfile);
        }


        //初期設定をDBに保存
        const profile = await db.profile.create({
            data: {
                userId: user.id,
                email: user.emailAddresses[0].emailAddress,
                name: name,
                imageUrl: imageUrl,
                isTeacher: isTeacher
            }
        });

        if (!profile) {
            return new NextResponse("Internal Error", { status: 500 })
        };

        return NextResponse.json(profile)

    } catch (error) {
        console.log("[PROFILE_POST_ERROR]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}


//プロフィール更新処理
export async function PATCH(
    req: Request,
) {
    try {

        //認証
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        };



        const profile = await db.profile.findUnique({
            where: {
                userId: userId
            }
        });

        if (!profile || !profile.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        };


        const {
            name,
            imageUrl,
            profileId
        } = await req.json();



        if (!name || !imageUrl || !profileId) {
            return new NextResponse("Missing required field", { status: 404 })
        };




        if (profileId !== profile.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        };


        //プロフィール更新処理
        const updatedProfile = await db.profile.update({
            where: {
                id: profile.id
            },
            data: {
                name: name,
                imageUrl: imageUrl
            }
        });

        return NextResponse.json(updatedProfile);

    } catch (error) {
        console.log("[PROFILE_EDIT]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}



//アカウント削除
export async function DELETE(
    req: Request
) {
    try {

        //認証
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        };



        const profile = await db.profile.findUnique({
            where: {
                userId: userId
            }
        });

        if (!profile || !profile.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        };



        const teams = await db.team.findMany({
            where: {
                members: {
                    some: {
                        profileId: profile.id
                    }
                }
            },
            include: {
                members: true
            }
        });

        //通知の送信処理
        for (const one_team of teams) {

            if (!one_team?.members) {
                return new NextResponse("members not found", { status: 404 })
            }

            //先生に通知を送信する
            for (const team_member of one_team?.members) {

                //生徒には通知は送らない
                if (team_member.role === "STUDENT") {
                    continue
                }

                await db.notification.create({
                    data: {
                        teamId: one_team.id,
                        profileId: team_member.profileId,
                        content: `生徒の${profile.name}さんがチームを脱退しました`,
                        checked: false
                    }
                })

            }
        }


        //グループが条件を満たさなくなったか確認
        for (const one_team of teams) {

            //メンバーが消えたことによってグループ使用の条件が崩壊していないかを確認する
            //例として、元から二人だったグループが、1人消えたことによって条件を満たさないということがある
            const groups = await db.group.findMany({
                where: {
                    teamId: one_team.id
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
            if (!one_team?.isPublishedGroup) {
                isvalid = false
            }

            //もし問題ありならとりあえずグループの使用を中止
            if (isvalid) {
                await db.team.update({
                    where: {
                        id: one_team.id
                    },
                    data: {
                        isPublishedGroup: false
                    }
                })
            }

        }

        //まずプロフィールを削除
        const deletedProfile = await db.profile.delete({
            where: {
                id: profile.id
            }
        });


        //次にclerkの方のアカウントも削除
        await clerkClient.users.deleteUser(userId);

        return NextResponse.json(deletedProfile)

    } catch (error) {
        console.log("[PROFILE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}