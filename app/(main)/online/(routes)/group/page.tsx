import { db } from "@/lib/db";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { GroupOnlineCient } from "../_components/group-online-client";

const GroupPage = async({
  searchParams
}:{
  searchParams:{
    teamId: string
  }
}) => {


  //認証
  const { userId } = auth();
  if (!userId) {
    return redirectToSignIn()
  };

  const profile = await db.profile.findFirst({
    where: {
      userId: userId
    }
  });

  if (!profile) {
    return redirect("/setup")
  }

  //searchparamsからチームを取得
  const team = await db.team.findFirst({
    where: {
      id: searchParams.teamId,
      members: {
        some: {
          profileId: profile.id
        }
      }
    },
    include: {
      online: true,
      groups: true,
      members: {
        include: {
          profile: true
        }
      }
    }
  });


  if (!team) {
    return redirect("/dashboard")
  }


  //現在のプロフィールを取得
  const currentMember = await db.member.findFirst({
    where: {
      teamId: team?.id,
      profileId: profile.id
    },
    include: {
      profile: true
    }
  });

  if (!currentMember) {
    return redirect("/")
  }

  // //もしonlineのstatusがnoneだったらオンライン授業は行われていないためreturn
  if (team.online === null || team.online?.status === "NONE") {
    return redirect(`/dashboard/teams/${team.id}`)
  };


  return (
    <div className=" h-full w-full">
      <GroupOnlineCient
        currentmember={currentMember}
        team={team}
      />
    </div>
  )
};

export default GroupPage;
