"use client"

import { Group, Member, Profile, Team } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MemberItem } from "@/components/member-item"
import { Separator } from "@/components/ui/separator"
import { Edit, MoreVertical, Trash } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useModal } from "@/hooks/use-modal"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"


//作成したグループ一覧のカード
interface GroupCardProps {
    member: Member,
    group: (Group & {
        members: (Member & {
            profile: Profile
        })[]
    }),
    team: (Team & {
        members: (Member & {
            profile: Profile
        })[]
    }),
    control: boolean
}

export const GroupCard = ({
    member: currentMember,
    group,
    team,
    control
}: GroupCardProps) => {


    const { onOpen } = useModal();
    const { toast } = useToast();
    const membersWithProfile = team.members //isGroupedがfalseのmembers

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);


    //グループ削除関数
    const onDeleteGroup = async () => {

        try {
            setIsLoading(true);
            await axios.delete(`/api/team/${team.id}/group/${group.id}`)
            toast({
                title: "グループを削除しました",
            });

            router.refresh();

        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false);
        }

    }

    return (
        <Card>
            <CardHeader>
                <div className=" flex items-center justify-between">
                    <div>
                        <CardTitle>
                            {group.name}
                        </CardTitle>
                    </div>
                    {control && (
                        <DropdownMenu>
                            <DropdownMenuTrigger className=" cursor-pointer focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 focus-visible:outline-none">
                                <MoreVertical />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="bottom" align="end">
                                {team.isPublishedGroup && (
                                    <DropdownMenuItem>
                                        <p className=" font-bold">
                                            グループの使用中は操作が行えません。
                                        </p>
                                    </DropdownMenuItem>
                                )}
                                {!team.isPublishedGroup && (
                                    <div>
                                        <DropdownMenuItem
                                            className=" cursor-pointer"
                                            disabled={isLoading}
                                            onClick={() => onOpen("editGroupModal", { group, membersWithProfile })}>
                                            <Edit className=" mr-2" />
                                            <p>
                                                編集
                                            </p>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={onDeleteGroup}
                                            disabled={isLoading}
                                            className=" text-rose-500 hover:text-rose-500 cursor-pointer">
                                            <Trash className=" mr-2 text-rose-500 hover:text-rose-500" />
                                            <p className=" hover:text-rose-500 text-rose-500">
                                                削除
                                            </p>
                                        </DropdownMenuItem>
                                    </div>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {group.members.map((member) => (
                    <div key={member.id}>
                        <MemberItem
                            member={member}
                            currentProfileId={currentMember.profileId}
                        />
                        <Separator />
                    </div>
                ))}
            </CardContent>
        </Card>
    )

}