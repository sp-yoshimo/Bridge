"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Member, Online } from "@prisma/client"
import { MonitorPlay, ScreenShareOff, Users } from "lucide-react"
import { useRouter } from "next/navigation"


export const OnlineClassInfo = ({
    online,
    member
}: {
    online: Online,
    member: Member
}) => {

    const router = useRouter();

    //グループのオンライン授業に参加する関数
    const onJoinGroup = () => {

        if (member.role === "STUDENT") {
            router.push(`/online/group/${member.groupId}?teamId=${online.teamId}`)
        } else {
            router.push(`/online/group?teamId=${online.teamId}`)
        }

    }

    return (
        <div className=" mt-5">

            <h3 className="text-2xl md:text-3xl font-bold">
                進行中のオンライン授業
            </h3>
            <Card className=" mt-3 bg-secondary h-auto p-1 md:p-3 w-full">
                <div className="h-full w-full">
                    <div className=" flex flex-col md:flex-row justify-between items-center p-2 md:p-5">
                        <div className=" flex items-center gap-x-2">
                            <div className=" h-10 w-10 bg-sky-200/50 dark:bg-sky-200 rounded-xl flex items-center justify-center">
                                <MonitorPlay className=" h-6 w-6 text-sky-600 " />
                            </div>
                            <p className="text-md md:text-xl">
                                チームのオンライン授業
                            </p>
                        </div>

                        <>
                            {/* onlineモデルのstatusフィールドでオンライン授業が行われているか確認 */}
                            {online.status === "TEAM" ? (
                                <div className=" flex flex-col items-center">
                                    <Button
                                        onClick={() => router.push(`/online?teamId=${online.teamId}`)}
                                        variant={"outline"}
                                        className="mb-1"
                                    >
                                        参加
                                    </Button>
                                    <p className=" text-muted-foreground">
                                        現在行われています
                                    </p>
                                </div>
                            ) : (
                                <div className=" flex flex-col items-center">
                                    <ScreenShareOff className=" h-10 w-10 mb-1 text-muted-foreground" />
                                    <p className=" text-muted-foreground text-sm">
                                        現在行われていません
                                    </p>
                                </div>
                            )}
                        </>
                    </div>

                    <Separator orientation="horizontal" className=" block w-full bg-muted-foreground/30" />

                    <div className="flex flex-col md:flex-row justify-between items-center p-2 md:p-5">
                        <div className=" flex items-center gap-x-2">
                            <div className=" h-10 w-10 bg-sky-200/50 dark:bg-sky-200 rounded-xl flex items-center justify-center">
                                <Users className=" h-6 w-6 text-sky-600" />
                            </div>
                            <p className="text-md md:text-xl">
                                グループのオンライン授業
                            </p>
                        </div>

                        <>
                            {/* onlineモデルのstatusフィールドでオンライン授業が行われているか確認 */}
                            {online.status === "GROUP" ? (
                                <div className=" flex flex-col items-center">
                                    <Button
                                        variant={"outline"}
                                        className="mb-1"
                                        onClick={onJoinGroup}
                                    >
                                        参加
                                    </Button>
                                    <p className=" text-muted-foreground">
                                        現在行われています
                                    </p>
                                </div>
                            ) : (
                                <div className=" flex flex-col items-center">
                                    <ScreenShareOff className=" h-10 w-10 mb-1 text-muted-foreground" />
                                    <p className=" text-muted-foreground text-sm">
                                        現在行われていません
                                    </p>
                                </div>
                            )}
                        </>
                    </div>
                </div>
            </Card>

        </div>

    )
}