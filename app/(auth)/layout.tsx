import React from "react";
import { AuthSidebar } from "./_components/auth-sidebar";
import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Loader, Loader2 } from "lucide-react";
import Logo from "@/components/logo";

//認証画面のレイアウト
const AuthLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <div className="h-full w-full">
            <div className=" hidden lg:flex h-full w-full">
                <AuthSidebar />
                <div className=" flex-grow">
                    <ClerkLoading>
                        <div className=" h-full w-full flex items-center justify-center">
                            <Loader2 className=" text-sky-500 animate-spin w-10 h-10" />
                        </div>
                    </ClerkLoading>
                    <ClerkLoaded>
                        {children}
                    </ClerkLoaded>

                </div>
            </div>
            <div className=" flex lg:hidden items-center justify-center h-full relative">
                <div className=" absolute top-5 left-5">
                    <Logo href="/"/>
                </div>
                {children}
            </div>
        </div>
    )
};

export default AuthLayout;
