"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const TeamSearchBar = () => {

    //userefで検索内容を監視
    const [search, setSearch] = useState("");

    const router = useRouter();
    const pathname = usePathname()

    //検索ボタンが押されたときに実行される関数
    const onSearch = (e: any) => {

        e.preventDefault();
        router.push(`${pathname}?q=${search}`)

    }

    useEffect(() => {

        if(search === ""){
            router.push(`${pathname}`)
        }

    }, [search])

    return (
        <form 
            onSubmit={(e) => onSearch(e)}
            className=" relative w-full lg:w-[500px] bg-secondary p-1 rounded-xl flex items-center gap-x-1">
            <Input
                onChange={(e) => setSearch(e.target.value)}
                placeholder="チームを検索..."
                className="w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Separator
                orientation="vertical"
                className=" h-[50px] w-[1px] dark:bg-slate-500"
            />
            <div className="flex items-center justify-center">
                <Button
                    type="submit"
                    variant={"ghost"}
                    className="hover:bg-slate-200 dark:hover:bg-slate-700 transition"    
                >
                    <Search className=" text-sky-500" />
                </Button>
            </div>
        </form>
    )
};

export default TeamSearchBar;
