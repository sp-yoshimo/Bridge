"use client"

import { Button } from "@/components/ui/button"
import { useModal } from "@/hooks/use-modal"
import { LogIn, Plus } from "lucide-react"

export const DashboardButton = ({
    isTeacher
}: {
    isTeacher: boolean
}) => {

    const { onOpen } = useModal();


    const onJoin = () => {
        onOpen("inventTeamModal")
    }

    const onCreate = () => {
        onOpen("createTeamModal")
    }

    return (
        <div className=" gap-x-1 md:gap-x-2 flex items-center">
            <Button
                onClick={onJoin}
                className=" gap-x-2 rounded-xl p-3 md:p-6">
                <LogIn className=" w-5 h-5" />
                <p className="hidden lg:block text-lg font-base">
                    チームに参加
                </p>
            </Button>
            {isTeacher && (
                <Button
                    onClick={onCreate}
                    variant="outline"
                    className=" gap-x-2 rounded-xl p-3 md:p-6">
                    <Plus className=" w-5 h-5" />
                    <p className="hidden lg:block text-lg font-base">
                        チームを作成
                    </p>
                </Button>
            )}
        </div>
    )
}