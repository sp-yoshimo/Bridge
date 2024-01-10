"use client"

import Logo from "@/components/logo"
import { cn } from "@/lib/utils"
import { Bell, Home, Settings } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export const Sidebar = ({
    isNewNotificate
}:{
    isNewNotificate: boolean
}) => {

    const pathname = usePathname();
    const router = useRouter();

    //サイドバーのルーティング
    const routes = [
        {
            label: "ホーム",
            icon: Home,
            href: "/dashboard",
            isActive: pathname.endsWith("/dashboard")
        },
        {
            label: "通知",
            icon: Bell,
            href: "/dashboard/notifications",
            isActive: pathname.includes("/dashboard/notifications")
        },
        {
            label: "設定",
            icon: Settings,
            href: "/dashboard/settings",
            isActive: pathname.includes("/dashboard/settings")
        }
    ]

    return (
        <div className="">

            <div className=" flex flex-col">


                <div className=" h-16 border-b w-full flex justify-center items-center">
                    <Logo
                        href="/dashboard"
                    />
                </div>

                <div className=" flex-grow flex flex-col">
                    {routes.map((route) => (
                        <div
                            onClick={() => router.push(route.href)}
                            className={cn(
                                ` p-5 w-full flex items-center justify-start hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer transition`,
                                route.isActive && "border-r-2 border-sky-500 bg-sky-100/50 dark:border-sky-600 dark:bg-blue-900/20 hover:bg-sky-100/50 dark:hover:bg-blue-900/20"
                            )}
                            key={route.label}>
                            <div className=" flex items-center gap-x-3 ">
                                <div className=" relative">
                                    <route.icon />
                                    {route.label === "通知" && isNewNotificate && (
                                        <div className=" w-2 h-2 rounded-full absolute -top-[1px] right-[1px] bg-sky-500" />
                                    )}
                                </div>
                                <p className=" text-black dark:text-white">
                                    {route.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

        </div>
    )
}