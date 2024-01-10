"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Member, Team } from "@prisma/client"
import axios from "axios"
import { Edit, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

//チームのお知らせを表示&編集できるコンポーネント
export const TeamNotificate = ({
    team,
    member
}: {
    team: Team,
    member: Member
}) => {


    const [notificate, setNotificate] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { toast } = useToast();

    //お知らせのテキストの初期値を取得
    useEffect(() => {

        if (team.notificate) {
            setNotificate(team.notificate)
        }

    }, [team.notificate])


    //お知らせ更新処理
    const onSubmit = async() => {
        try{

            setIsLoading(true);
            await axios.patch(`/api/team/${team.id}`, {
                notificate: notificate
            });
            toast({
                title: "お知らせを更新しました"
            });

            setIsEditing(false);
            router.refresh();


        }catch(error){
            console.log(error);
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
        }finally{
            setIsLoading(false);
        }
    }

    return (
        <div className=" mt-5">
            <h3 className="text-2xl md:text-3xl font-bold">
                お知らせ
            </h3>
            <Card className=" mt-3 bg-secondary h-auto p-1 md:p-3 w-full relative">
                <div className="h-full w-full px-5 py-5">
                    <div>
                        {isEditing ? (
                            <div>
                                <Textarea
                                    className="focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                                    rows={5}
                                    defaultValue={notificate}
                                    onChange={(e) => setNotificate(e.target.value)}
                                    placeholder="このチーム内のメンバーにお知らせしたいことを書いてください"
                                />
                                <div className=" mt-3 flex items-center justify-end">
                                    <Button
                                        className=""
                                        variant="outline"
                                        onClick={onSubmit}
                                        disabled={isLoading}
                                    >
                                        更新
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {notificate ? (
                                    <h3 className=" text-lg">
                                        {notificate}
                                    </h3>
                                ) : (
                                    <h3 className=" text-muted-foreground text-md">
                                        お知らせはありません
                                    </h3>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {member.role !== "STUDENT" && (
                    <div
                        onClick={() => setIsEditing((current) => !current)}
                        className=" absolute cursor-pointer hover:scale-105 transition -top-3 -right-3 w-10 h-10 rounded-full bg-slate-950 dark:bg-white p-2 flex items-center justify-center">
                        {isEditing && !isLoading ? (
                            <X className=" text-white dark:text-slate-950" />
                        ) : (
                            <Edit className=" text-white dark:text-slate-950" />
                        )}
                    </div>
                )}
            </Card>
        </div>

    )
}