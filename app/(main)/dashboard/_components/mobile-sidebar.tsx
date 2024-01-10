"use client"


import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Sidebar } from "./sidebar";

const MobileSidebar = ({
    isNewNotificate
}:{
    isNewNotificate: boolean
}) => {


    //ページがマウントされたか(ハイドレーションエラーを防ぐため)
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if(!isMounted){
        return null;
    }

    return (
        <Sheet>
            <SheetTrigger>
                <Button variant={"ghost"} size="icon" className=" focus-visible:ring-0 focus-visible:ring-offset-0" asChild>
                    <Menu className=" h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className=" p-0">
                <Sidebar
                    isNewNotificate={isNewNotificate}
                />
            </SheetContent>
        </Sheet>
    )
};

export default MobileSidebar;
