"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Member, Team } from "@prisma/client"
import { Check, Copy, Settings, Users } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

export const OtherSettings = ({
    team,
    member
}: {
    team: Team,
    member: Member
}) => {

    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false)

    const router = useRouter()

    const { toast } = useToast();

    //参加コードコピー
    const onCopy = () => {
        navigator.clipboard.writeText(team.inviteCode);

        setCopied(true)
        toast({
            title: "参加コードをコピーしました"
        })

        setTimeout(() => {
            setCopied(false)
        }, 1000)
    }


    //新しい参加コード再生成
    const onNew = async() => {
        try {

            setIsLoading(true)

            await axios.patch(`/api/team/${team.id}/invite`);
            toast({
                title: "参加コードを再生成しました"
            });

            router.refresh()

        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    //チームを削除
    const onDelete = async () => {
        try {

            setIsLoading(true)

            await axios.delete(`/api/team/${team.id}`);
            toast({
                title: "チームを削除しました"
            });
            router.push(`/dashboard`)

        } catch (error) {

            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
            console.log(error)

        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <Dialog
                open={isOpen}
                onOpenChange={() => setIsOpen(false)}
            >
                <DialogContent className=" p-0 overflow-hidden">
                    <div>
                        <DialogHeader className="py-5">
                            <DialogTitle className=" text-2xl text-center font-bold">
                                確認
                            </DialogTitle>
                            <DialogDescription className=" text-lg text-center w-3/4 mx-auto">
                                本当にチームを削除しますか？
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="border-t w-full">
                            <div className="w-full flex justify-between items-center py-3 px-4">
                                <Button variant="ghost" type="button" onClick={() => {
                                    setIsOpen(false);
                                }}>
                                    キャンセル
                                </Button>
                                <Button
                                    onClick={onDelete}
                                    disabled={isLoading}
                                    variant="destructive"
                                >
                                    削除
                                </Button>
                            </div>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
            <div className=" justify-between w-full flex items-end md:items-center">
                <div className="block md:flex items-center gap-x-2 pr-2 md:p-0">
                    <div className="hidden sm:flex h-10 w-10 bg-sky-200/50 dark:bg-sky-200 rounded-xl items-center justify-center">
                        <Settings className=" h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl">
                            その他の設定
                        </h3>
                    </div>
                </div>
            </div>

            <div className=" my-5">
                <Separator className=" mt-2" />
            </div>

            {/* 参加コード */}
            <div className=" mt-8">
                <div className=" flex flex-col">
                    <p className=" font-bold">
                        参加コード
                    </p>
                    <div>
                        <div className="flex items-center mt-2 gap-x-2">
                            <Input
                                disabled={isLoading}
                                readOnly
                                className=" bg-zinc-300/50 dark:bg-zinc-700/50 border-0 focus-visible:ring-0 w-full text-black
                             focus-visible:ring-offset-0 dark:text-white
                            "
                                value={team.inviteCode}
                            />
                            <Button
                                disabled={isLoading}
                                onClick={onCopy}
                                size={"icon"}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <div 
                            onClick={onNew}
                            className=" text-sm mt-1 cursor-pointer hover:text-black dark:hover:text-white transition text-muted-foreground ">
                            新しい参加コードを生成する
                        </div>
                    </div>
                </div>
            </div>

            {/* チームの削除 */}
            <div className=" mt-16">
                <div className=" flex flex-row items-center justify-end">
                    <div className="flex flex-col items-end">
                        <Button
                            variant="destructive"
                            onClick={() => setIsOpen(true)}
                            disabled={isLoading || member.role !== "ADMIN"}
                        >
                            チームを削除
                        </Button>
                        {member.role !== "ADMIN" && (
                            <p className=" text-sm text-muted-foreground pt-2">
                                このチームの管理者のみチームの削除を行えます
                            </p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )

}