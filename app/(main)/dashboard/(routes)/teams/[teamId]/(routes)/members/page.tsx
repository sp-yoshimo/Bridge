import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import React from "react";
import { MembersList } from "../../_components/members-list";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { MembersClient } from "../../_components/members-client";

const TeamidMemberPage = async ({
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

  const members = await db.member.findMany({
    where: {
      teamId: params.teamId
    },
    include: {
      profile: true
    },
    orderBy:{
      profile:{
        name: "asc"
      }
    }
  });

  if (!members) {
    return redirect("/")
  };


  
  return (
    <div className="p-5">
      <div className=" flex flex-col mt-5">
        <h3 className="text-2xl md:text-3xl font-bold">
          チームのメンバー
        </h3>
        <MembersClient
          members={members}
          profile={profile}
        />
      </div>
    </div>
  )
};

export default TeamidMemberPage;
