import { db } from "@/lib/db";
import { auth, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";
import MobileSidebar from "./mobile-sidebar";
import ActionIcon from "./action-icon";

const Navbar = async ({
    isNewNotificate
}:{
    isNewNotificate: boolean
}) => {

    const { userId } = auth();

    if (!userId) {
        return redirectToSignIn();
    }

    const profile = await db.profile.findUnique({
        where: {
            userId: userId
        }
    });

    if (!profile || !profile.imageUrl) {
        return redirect("/setup")
    }

    return (
        <div className="flex w-full justify-between items-center py-3 px-3 ">
            <div>
                <MobileSidebar 
                    isNewNotificate={isNewNotificate}
                />
            </div>
            <div>
                <ActionIcon
                    profile={profile}    
                />
            </div>
        </div>
    )
};

export default Navbar;
