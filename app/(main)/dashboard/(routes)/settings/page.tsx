import { ThemeToggle } from "@/components/thtme-toggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";
import UserSettings from "./_components/user-settings";
import DangerSettings from "./_components/danger-settings";
import { Separator } from "@/components/ui/separator";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";


//アプリの設定ページ
const SettingsPage = async () => {

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

  return (
    <div className=" p-3 max-w-4xl mx-auto">
      <div>
        <div className="h-[60px] border-b">
          <h3 className=" font-bold text-xl md:text-2xl lg:text-3xl">
            設定
          </h3>
        </div>

        <div className=" w-full mb-10 p-2 md:p-5">

          <div className=" flex items-center justify-between w-full px-1 md:px-5">
            <div className=" flex flex-col">
              <p className=" text-xl font-bold">
                テーマを切り替える
              </p>
              <p className="text-muted-foreground text-sm">
                ライトモード/ダークモードに切り替えることができます
              </p>
            </div>
            <ThemeToggle />
          </div>

          <Separator className=" my-5" />

          <div className="px-1 md:px-5">
            <UserSettings
              currentProfile={profile}
            />
          </div>

          <Separator className=" my-5" />

          <div className="px-1 md:px-5">
            <DangerSettings />
          </div>


        </div>
      </div >
    </div >
  )
};

export default SettingsPage;
