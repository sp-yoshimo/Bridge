import { db } from "@/lib/db";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { MemberRole } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";
import { TeamNavber } from "./_components/team-navbar";
import { ScrollArea } from "@/components/ui/scroll-area";

//dashboard/teams/[teamId]の共通レイアウト
const TeamIdLayout = async ({
  children,
  params
}: {
  children: React.ReactNode,
  params: {
    teamId: string
  }
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

  //チームをdbから取得
  const team = await db.team.findUnique({
    where: {
      id: params.teamId
    },
    include: {
      members: {
        include: {
          profile: true
        }
      },
      online: true
    }
  });
  //IDのチームが存在しないときリダイレクト
  if (!team) {
    return redirect("/dashboard")
  }

  //現在の自分のmemberモデルを取得
  const member = await db.member.findFirst({
    where: {
      profileId: profile.id,
      teamId: team.id
    }
  });

  //もしこのteamに属していなかったら/dashboardにリダイレクト
  if (!member) {
    return redirect("/dashboard")
  }


  return (
    <div className=" flex flex-col h-full">
      <div className="w-full border-b">
        <TeamNavber
          team={team}
          member={member}
        />
      </div>
      <ScrollArea className="w-full flex-grow">
        <div className=" max-w-lg sm:max-w-4xl mx-auto">
          {children}
        </div>
      </ScrollArea>
    </div>
  )
};

export default TeamIdLayout;
