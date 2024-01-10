import { auth, redirectToSignIn } from "@clerk/nextjs";
import React from "react";
import TeamSearchBar from "./_components/team-search-bar";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardButton } from "./_components/dashboard-button";
import { TeamList } from "@/components/team-list";
import { TeamWithAuthorAndMembers } from "@/types";
import { NotFound } from "@/components/not-found";


//Dashboardのホームページ
const DashboardPage = async ({
  searchParams
}: {
  searchParams: {
    q: string
  }
}) => {

  const { userId } = auth();

  if (!userId) {
    return redirectToSignIn()
  };

  const profile = await db.profile.findUnique({
    where: {
      userId: userId
    },
  });

  if (!profile) {
    return redirect("/setup")
  };

  let teams: TeamWithAuthorAndMembers[] = []
  if (searchParams.q) {
    teams = await db.team.findMany({
      where: {
        members: {
          some: {
            profileId: profile.id
          }
        },
        name: {
          contains: searchParams.q
        }
      },
      include: {
        members: true,
        author: true,
        online: true
      }
    })
  } else {
    teams = await db.team.findMany({
      where: {
        members: {
          some: {
            profileId: profile.id
          }
        }
      },
      include: {
        members: true,
        author: true,
        online: true
      }
    })
  }




  return (
    <div className="h-full">
      <div className=" flex h-full flex-col w-full">
        <div className="flex flex-col-reverse md:flex-row gap-y-4 md:space-y-0 items-end md:items-center justify-between p-5 w-full gap-x-4">
          <TeamSearchBar />
          <DashboardButton
            isTeacher={profile.isTeacher}
          />
        </div>

        <div className=" p-5 h-full w-full">
          {/* チーム数が0の場合別のコンポーネントを表示 */}
          {teams.length === 0 && (
            <div className=" w-full h-full">
              {searchParams.q ? (
                <div className=" h-full w-full">
                  <NotFound
                    searched
                  />
                </div>
              ) : (
                <div className=" w-full h-full">
                  <NotFound
                    searched={false}
                  />
                </div>
              )}
            </div>
          )}
          <TeamList
            teams={teams}
            filter
          />
        </div>
      </div>
    </div>
  )
};

export default DashboardPage;
