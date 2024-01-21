"use client"

import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
                            className="hover:opacity-75 transition"
                            asChild
                        >
                            <Link href={"/dashboard"}>
                                ダッシュボード
                            </Link>
                        </Button>
                    </div>
                )}
                {!isLogin && (
                    <div className=" flex items-center gap-x-3">
                        <Button
                            className="bg-sky-500 hover:bg-sky-500 hover:opacity-75 transition"
                        >
                            <Link href={"/sign-in"}>
                                サインイン
                            </Link>
                        </Button>
                        <Button
                            variant={"outline"}
                        >
                            <Link href={"/sign-in"}>
                                サインアップ
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LandingNavbar
