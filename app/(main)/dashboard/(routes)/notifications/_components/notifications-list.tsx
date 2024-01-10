"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Notification, Team } from "@prisma/client"
import axios from "axios"
import { ArrowRight, CheckCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { formatDistance, format } from "date-fns"
import { ja } from "date-fns/locale"

//通知一覧
export const NotificationsList = ({
    notifications
}: {
    notifications: (Notification & {
        team: Team
    })[]
}) => {


    const router = useRouter()
    const { toast } = useToast()

    const [isLoading, setIsLoading] = useState("");

    const onCheckNotification = async (id: string) => {
        try {

            setIsLoading(id);

            await axios.patch(`/api/notification/${id}`);
            router.refresh();

        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
            console.log(error)
        } finally {
            setIsLoading("")
        }
    }

    if (notifications.length === 0) {
        return (
            <div className=" w-full h-full pt-20 flex items-center justify-center">
                <p className=" text-muted-foreground text-lg">
                    通知はありません
                </p>
            </div>
        )
    }

    return (
        <div className=" w-full">
            <div className=" flex flex-col space-y-3">
                {notifications.map((notification) => (
                    <Card
                        key={notification.id}
                        className="flex flex-col p-3"
                    >
                        <div className="flex w-full items-center justify-between border-b pb-2">
                            <p className="font-bold">
                                {notification.team.name}
                            </p>
                            {notification.href && (
                                <Button
                                    className=""
                                    variant="link"
                                    size={"icon"}
                                    disabled={isLoading === notification.id}
                                    onClick={() => {
                                        router.push(notification.href!)
                                    }}
                                >
                                    <ArrowRight className=" hover:translate-x-1 transition" />
                                </Button>
                            )}
                        </div>
                        <div className=" w-full pt-2 flex items-center justify-between">
                            <div>
                                <p>
                                    {notification.content}
                                </p>
                                <p className=" text-xs text-muted-foreground mt-1">
                                    {formatDistance(new Date(), notification.createdAt, {
                                        locale: ja
                                    })}前
                                </p>
                            </div>
                            <div>
                                <Button
                                    size={"icon"}
                                    className=" bg-sky-500 hover:bg-sky-500 hover:opacity-75 transition"
                                    onClick={() => onCheckNotification(notification.id)}
                                    disabled={isLoading === notification.id}
                                >
                                    {isLoading === notification.id && (
                                        <Loader2 className=" animate-spin w-5 h-5" />
                                    )}
                                    {isLoading !== notification.id && (
                                        <CheckCircle className=" w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}