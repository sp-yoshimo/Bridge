"use client"


import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useClerk } from "@clerk/nextjs";
import { Profile } from "@prisma/client";
import { LogOut, Settings } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const ActionIcon = ({
    profile
}:{
    profile: Profile
}) => {

    const router = useRouter();

    const { signOut, openUserProfile } = useClerk();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className=" focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 focus-visible:outline-none">
                <div className=" relative h-10 w-10 rounded-full overflow-hidden border">
                    <Image
                        src={profile.imageUrl!}
                        fill
                        alt="icon"
                        className=" object-cover"
                    />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
                <DropdownMenuItem className=" py-2">
                    <div onClick={() => {}}>
                        <p className=" font-bold">
                            {profile.name}
                        </p>
                        <p className=" text-muted-foreground text-xs">
                            {profile.email}
                        </p>
                    </div>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem className=" py-2" onClick={() => {
                    signOut(() => router.push("/"))
                }}>
                    <div className=" flex w-full justify-start">
                        <LogOut className="mr-1" />
                        <p className=" font-bold">サインアウト</p>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

export default ActionIcon;
