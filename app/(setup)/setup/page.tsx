import React from "react";
import SetupNavbar from "./_components/setup-navbar";
import { db } from "@/lib/db";
import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import InitialForm from "./_components/initial-form";

//ユーザーの初期設定等を行うページ
const SetupPage = async () => {

    //初期設定ページはまだ初期設定を行っていないユーザーしか行けないようにする

    const user = await currentUser();

    if (!user || !user.id) {
        return redirectToSignIn(); //未ログイン時はログインページへ飛ばす
    }

    const profile = await db.profile.findUnique({
        where: {
            userId: user.id
        }
    });

    if (profile) {
        return redirect("/dashboard") //初期設定データがある場合は/dashboardに飛ばす
    };


    return (
        <div className=" w-full h-full flex flex-col">
            <div className="h-16 fixed top-0 backdrop-blur-md border-b w-full">
                <SetupNavbar />
            </div>
            <main className=" w-full h-full pt-36 md:pt-0 flex items-center justify-center">
                <div className="w-full lg:w-1/2">
                    <div className="flex flex-col items-center">

                        <div className=" flex flex-col items-center space-y-2 mb-10">
                            <h3 className=" text-2xl">
                                ようこそBridgeへ!
                            </h3>
                            <p className=" text-muted-foreground text-sm">
                                最初に初期設定を行います
                            </p>
                        </div>

                        <InitialForm
                            currentImageUrl={user.imageUrl}
                        />

                    </div>
                </div>
            </main>
        </div>
    )
};



export default SetupPage