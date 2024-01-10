"use client"

import { cn } from "@/lib/utils"
import { Member, Profile } from "@prisma/client"
import Image from "next/image"
import { useRouter } from "next/navigation"


export const MemberItem = ({
    member,
    currentProfileId
}: {
    member: Member & {
        profile: Profile
    },
    currentProfileId: string
}) => {


    return (
        <div
            className={cn(
                `flex items-center gap-x-2 p-3`,
            )}
        >
            <div className=" relative w-12 h-12 border rounded-full overflow-hidden">
                <Image
                    src={member.profile.imageUrl!}
                    fill
                    alt="icon"
                    className=" object-cover"
                />
            </div>
            <div className=" flex flex-col">
                <p className={cn(
                    ` text-base`,
                    member.profile.id === currentProfileId && "text-sky-500"
                )}>
                    {member.profile.name}
                </p>
                <p className=" text-muted-foreground text-sm">
                    {member.profile.email}
                </p>
            </div>
        </div>
    )
}