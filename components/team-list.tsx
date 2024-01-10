"use client"

import { useEffect, useState } from "react"
import { TeamCard } from "./team-card"
import { TeamWithAuthorAndMembers } from "@/types"
import { NotFound } from "./not-found"

interface TeamListProps {
    teams: TeamWithAuthorAndMembers[],
    filter: boolean
}

//チーム一覧を表示するコンポーネント
export const TeamList = ({
    teams,
}: TeamListProps) => {

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true)
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <div>
            <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {teams.map((team) => (
                    <TeamCard
                        authorName={team.author.name}
                        authorImageUrl={team.author.imageUrl!}
                        teamId={team.id}
                        name={team.name}
                        description={team.description}
                        imageUrl={team.imageUrl || "/images/default-team-img.jpg"}
                        membersLength={team.members.length}
                        key={team.id}
                        online={team.online}
                    />
                ))}
            </div>
        </div>
    )
} 