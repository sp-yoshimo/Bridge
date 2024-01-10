import { Info, MoreVertical } from "lucide-react";
import React from "react";
import { TeamInfoSettings } from "../../_components/team-info-settings";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SettingsClient } from "../../_components/settings-client";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { MobileSettingTabs } from "../../_components/mobile-settings-tabs";

const TeamIdSettingPage = async ({
  params
}: {
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

  //チームを取得(idで)(グループの作成で使うため、membersも取得しておく(roleがstudentの),五十音順にmemberを取得)
  const team = await db.team.findUnique({
    where: {
      id: params.teamId
    },
    include: {
      members: {
        where: {
          role: "STUDENT",
          isGrouped: false
        },
        include: {
          profile: true
        },
        orderBy: {
          profile: {
            name: "asc"
          }
        }
      },
      groups: {
        include: {
          members: {
            include: {
              profile: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      quizs: {
        include: {
          questions: {
            include:{
              choices: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      online: true
    }
  });

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

  //もしmemberのロールがstudentだったらteams/[teamId]/にリダイレクト
  if (member.role === "STUDENT") {
    return redirect(`/dashboard/teams/${team.id}`)
  }

  return (
    <div className="p-5">
      <div className=" flex flex-col mt-5">
        <div className=" flex gap-x-1 items-center">
          <h3 className="text-2xl md:text-3xl font-bold">
            チームの設定
          </h3>
          <MobileSettingTabs />
        </div>
        <div className=" mt-8">
          <SettingsClient team={team} currentmember={member} />
        </div>
      </div>
    </div>
  )
};

export default TeamIdSettingPage;
