"use client"

import { GroupCard } from "@/components/group-card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useModal } from "@/hooks/use-modal"
import { GroupManagementType } from "@/types"
import { Member } from "@prisma/client"
import axios from "axios"
import { Loader2, Users, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const GroupSettings = ({
    team,
    member
}: {
    team: GroupManagementType,
    member: Member
}) => {


    const { onOpen } = useModal();
    const { toast } = useToast();

    const router = useRouter();

    const membersWithProfile = team.members
    const groups = team.groups;

  

    const [isLoading, setIsLoading] = useState(false);

    //グループ達をオンラインで使用可能か確認する必要がある
    //1.すべてのメンバーがいづれかのグループに属している
    //2.メンバーが重複していない(これに関してはフロントエンドとバックエンド両方でバリデーション済みなので問題なし)
    //3.一つのグループに2人以上のメンバーがいる
    //4.最低でも1つのグループは存在すること

    //1.すべてのメンバーがいづれかのグループに属しているか検証
    const belongEvery = membersWithProfile.every((member) => member.isGrouped);

    //3.つのグループに2人以上のメンバー
    const numberofMember = groups.every((group) => group.members.length > 1)

    //4.最低でも1つのグループは存在すること
    const isExsistingGroup = groups.length != 0

    //上記の条件を複合
    const canUse = belongEvery && numberofMember && isExsistingGroup

    //グループの使用、不使用を切り替える
    const ToggleGroupPublish = async () => {

        try {

            setIsLoading(true);

            //もし既に使用されていたら使用中止、そうでない場合、使用
            if (team.isPublishedGroup) {
                await axios.patch(`/api/team/${team.id}/group/publish`, {
                    publish: false
                })
                toast({
                    title: "グループの使用を中止しました"
                })
            } else {
                await axios.patch(`/api/team/${team.id}/group/publish`, {
                    publish: true
                })

                toast({
                    title: "グループの使用を可能にしました"
                })
            }

            router.refresh();


        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
            console.log(error)
        } finally {
            setIsLoading(false);
        }


    }

    return (
        <div>
            <div className=" justify-between w-full flex items-end md:items-center">
                <div className="block md:flex items-center gap-x-2 pr-2 md:p-0">
                    <div className="hidden sm:flex h-10 w-10 bg-sky-200/50 dark:bg-sky-200 rounded-xl items-center justify-center">
                        <Users className=" h-6 w-6 text-sky-600" />
                    </div>
                    <div className=" mt-2 md:mt-0">
                        <h3 className="text-xl md:text-2xl">
                            グループの管理
                        </h3>
                    </div>
                </div>
                {team.isPublishedGroup && (
                    <Button
                        disabled={isLoading}
                        onClick={() => ToggleGroupPublish()}
                    >
                        {isLoading ? (
                            <Loader2 className=" animate-spin" />
                        ) : (
                            <p className="">
                                使用中止
                            </p>
                        )}
                    </Button>
                )}
                {!team.isPublishedGroup && (
                    <Button
                        disabled={!canUse || isLoading}
                        onClick={() => ToggleGroupPublish()}
                    >
                        {isLoading ? (
                            <Loader2 className=" animate-spin" />
                        ) : (
                            <p className="">
                                {canUse ? "使用" : "使用できません"}
                            </p>
                        )}
                    </Button>
                )}
            </div>

            <div className=" my-5">
                <p className=" text-xs text-muted-foreground">
                    使用ボタンを押さないと作成したグループをオンライン授業で使うことができません
                </p>
                <Separator className=" mt-2" />
            </div>


            <div>
                <div className=" flex justify-between">
                    <div
                        onClick={() => onOpen("explainCreateGroupModal")}
                        className=" font-bold text-sm hover:text-sky-500 transition cursor-pointer">
                        作成したグループ達を使用できる条件について
                    </div>
                </div>

                <div className=" my-5">
                    <Separator className="mt-2" />
                </div>
            </div>


            <div>
                <div className=" flex items-center justify-between">
                    <div>
                        <h3 className=" font-bold">
                            作成したグループ
                        </h3>
                    </div>
                    <div className=" flex flex-col">
                        <Button
                            variant={"outline"}
                            onClick={() => onOpen("createGroupModal", { membersWithProfile, team })}
                            disabled={isLoading || team.isPublishedGroup || team.online?.status !== "NONE"}
                        >
                            <p>
                                グループを作成
                            </p>
                        </Button>
                        {team.isPublishedGroup && (
                            <p className=" text-xs text-muted-foreground mt-2">
                                グループの使用中もしくはオンライン授業中は作成を行えません
                            </p>
                        )}
                    </div>
                </div>
                {groups.length <= 0 && (
                    <div className=" mt-10">
                        <p className=" text-muted-foreground text-center">
                            グループはありません
                        </p>
                    </div>
                )}
                {groups.length > 0 && (
                    <div className=" mt-5 space-y-5">
                        {groups.map((group) => (
                            <GroupCard
                                key={group.id}
                                member={member}
                                team={team}
                                control
                                group={group}
                            />
                        ))}
                    </div>
                )}
            </div>

        </div >
    )

}