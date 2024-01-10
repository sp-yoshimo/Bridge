"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"


//モバイル画面用の設定画面のページ遷移タブ
export const MobileSettingTabs = () => {

    const router = useRouter();
    const pathname = usePathname();
    

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 focus-visible:outline-none">
                <MoreVertical className=" block md:hidden cursor-pointer" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end">
                <DropdownMenuItem
                    onClick={() => {router.push(pathname + "?mode=information")}}
                >
                    チーム情報の設定
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {router.push(pathname + "?mode=group")}}
                >
                    グループの管理
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {router.push(pathname + "?mode=quiz")}}
                >
                    クイズの管理
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => {router.push(pathname + "?mode=other")}}
                >
                    その他の設定
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}