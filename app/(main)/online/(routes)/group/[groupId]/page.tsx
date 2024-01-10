import { db } from "@/lib/db";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import { GroupOnlineCient } from "../../_components/group-online-client";


//オンライン授業用のページ
const GroupIdPage = async ({
  params,
  searchParams
}: {
  params: {
    groupId: string
  },
  searchParams: {
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
      members: {
        include: {
          profile: true
        }
      },
      groups:{
        include:{
          members:{
            include:{
              profile: true
            }
          }
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

  //もしonlineのstatusがnoneだったらオンライン授業は行われていないためreturn
  if (!team.online || team.online?.status === "NONE") {
    return redirect(`/dashboard/teams/${team.id}`)
  };


  //もしteamモードだったらチームオンラインページへ移行
  if (team.online.status === "TEAM") {
    return redirect(`/online?teamId=${team.id}`)
  }

  //もし生徒ではないならグループモード(先生ページ)へ移行
  if (currentMember.role !== "STUDENT") {
    return redirect(`/online/group?teamId=${team.id}`)
  }

  //自分の所属するgroupを取得
  const group = await db.group.findFirst({
    where: {
      id: params.groupId,
      members: {
        some: {
          profileId: profile.id
        }
      }
    }
  });

  //グループidが間違えているorそのグループに所属していない場合
  if (!group) {

    //ほかに所属しているグループがある場合、そこに飛ばす。ない場合は特別ページへ飛ばす
    if (currentMember.groupId) {

      return redirect(`/online/group/${currentMember.groupId}?teamId=${team.id}`)

    } else {
      return redirect(`/online/group?teamId=${team.id}`)
    }

  }

  const groups = await db.group.findMany({
    where:{
      teamId: team.id
    },
    include:{
      members:{
        include:{
          profile: true
        }
      }
    }
  });

  if(!groups || groups.length <= 0 || !team.isPublishedGroup){
    //グループ数が条件に満たしていない or グループの使用がoffだったらonlinestatusをteamに戻してリダイレクト
    await db.online.update({
      where:{
        id: team.online.id
      },
      data:{
        status: "TEAM"
      }
    });

    return redirect(`/online?teamId=${team.id}`)
  }


  return (
    <div className=" w-full h-full">
      <GroupOnlineCient
        team={team}
        currentmember={currentMember}
        group={group}
      />
    </div>
  )
};

export default GroupIdPage;
