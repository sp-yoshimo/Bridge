"use client"

import Logo from "@/components/logo";
import { ThemeToggle } from "@/components/thtme-toggle";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const SetupNavbar = () => {


    //マウントされたか(エラーを防ぐため)
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const { signOut } = useClerk();
    const router = useRouter();

    if (!isMounted) {
        return null;
    }


    return (
        <div className="  py-3 z-50 px-3 md:px-1 flex items-center max-w-7xl mx-auto justify-between ">
            <Logo href="/" />
            <div className=" flex items-center gap-x-3">
                <div className=" flex items-center">
                    <Button
                        variant={"ghost"}
                        onClick={() => {
                            signOut(() => router.push("/sign-in"));
                        }}
                    >
                        サインアウト
                        <LogOut className=" ml-1" />
                    </Button>
                </div>
                <ThemeToggle />
            </div>
        </div>
    )
};

export default SetupNavbar;
