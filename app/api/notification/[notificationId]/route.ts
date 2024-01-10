import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

//通知更新
export async function PATCH(
    req: Request,
    { params }: {
        params: {
            notificationId: string
        }
    }
) {
    try {

        //認証
        const { userId } = auth()
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const profile = await db.profile.findFirst({
            where: {
                userId
            }
        });

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 })
        };

        const notification = await db.notification.findUnique({
            where: {
                id: params.notificationId
            }
        });

        if (!notification) {
            return new NextResponse("Notification not found", { status: 404 })
        };

        //もし、変更している通知が自分自身の通知ではないならエラーを吐く
        if (notification.profileId !== profile.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        };

        //更新処理
        const updatedNotification = await db.notification.update({
            where: {
                id: params.notificationId
            },
            data: {
                checked: true
            }
        })


        return NextResponse.json(updatedNotification)

    } catch (error) {
        console.log("[NOTIFICATION_ID]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}