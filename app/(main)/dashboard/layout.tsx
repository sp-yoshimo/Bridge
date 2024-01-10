import { db } from "@/lib/db";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { Sidebar } from "./_components/sidebar";
import Navbar from "./_components/navbar";


//Dashboardページのレイアウト
const DadhboardLayout = async ({
  children
}: {
  children: React.ReactNode
}) => {


  //未ログイン or 初期設定が完了していない場合はリダイレクト
  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn();
  }

  const profile = await db.profile.findUnique({
    where: {
      userId: userId
    }
  });

  if (!profile) {
    return redirect("/setup")
  };

  const notifications = await db.notification.findMany({
    where: {
      profileId: profile.id,
      checked: false
    }
  })

  //新しい通知があるか
  const isNewNotificate = notifications.length === 0 ? false : true


  return (
    <div className=" h-full w-full">
      <div className="hidden md:flex w-56 flex-col fixed inset-y-0 z-50 border-r bg-white dark:bg-slate-950 ">
        <Sidebar
          isNewNotificate={isNewNotificate}
        />
      </div>
      <div className=" h-16 fixed inset-0 top-0 backdrop-blur-lg md:bg-transparent md:backdrop-blur-0 w-full">
        <Navbar />
      </div>
      <div className=" h-full md:pl-56 pt-16">
        {children}
      </div>
    </div>
  )
};

export default DadhboardLayout;
