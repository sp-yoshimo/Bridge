"use client"

import { MemberItem } from "@/components/member-item"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Member, Profile } from "@prisma/client"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface MembersListProps {
    members: (Member & {
        profile: Profile
    })[],
    currentProfileId: string
}


export const MembersList = ({
    members,
    currentProfileId
}: MembersListProps) => {


    return (
        <div className=" flex flex-col my-3">
            {members.map((member) => (
                <div
                    key={member.id}
                    className=" w-full"
                >
                    <MemberItem
                        member={member}
                        currentProfileId={currentProfileId}
                    />
                    <Separator />
                </div>
            ))}
        </div>
    )

}