import { db } from "@/lib/db";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { NotificationsList } from "./_components/notifications-list";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotificationsPage = async () => {

  //認証
  const { userId } = auth()
  if (!userId) {
    return redirectToSignIn()
  }

  const profile = await db.profile.findFirst({
    where: {
      userId: userId
    }
  })
  if (!profile) {
    return redirect("/setup")
  }

  const notifications = await db.notification.findMany({
    where: {
      profileId: profile.id,
      checked: false
    },
    include: {
      team: true,
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return (
    <div className=" p-3 max-w-4xl mx-auto">
      <div>
        <div className="h-[60px] border-b">
          <h3 className=" font-bold text-xl md:text-2xl lg:text-3xl">
            通知
          </h3>
        </div>

        <ScrollArea className=" w-full h-auto p-5 pb-10">
          <NotificationsList
            notifications={notifications}
          />
        </ScrollArea>
      </div>
    </div>
  )
};

export default NotificationsPage;
