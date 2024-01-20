"use client"

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"


//ランディングページのナビゲーションバー
const LandingNavbar = ({
    isLogin
}: {
    isLogin: boolean
}) => {

    const [isMounted, setIsMounted] = useState(false);

    const router = useRouter();

    useEffect(() => {
        setIsMounted(true)
    }, []);

    if (!isMounted) {
        return null
    }

    return (
        <div className=" h-full px-3">
            <div className="h-full max-w-4xl mx-auto flex items-center justify-between">
                <div className="hidden sm:block">
                    <Logo />
                </div>

                {isLogin && (
                    <div>
                        <Button
                            variant="premium"
                            onClick={() => router.push(`/dashboard`)}
                            className="hover:opacity-75 transition"
                        >
                            ダッシュボード
                        </Button>
                    </div>
                )}
                {!isLogin && (
                    <div className=" flex items-center gap-x-3">
                        <Button
                            className="bg-sky-500 hover:bg-sky-500 hover:opacity-75 transition"
                            onClick={() => router.push(`/sign-in`)}
                        >
                            サインイン
                        </Button>
                        <Button
                            variant={"outline"}
                            onClick={() => router.push(`/sign-up`)}
                        >
                            サインアップ
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LandingNavbar
