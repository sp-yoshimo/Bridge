"use client"

import Logo from "@/components/logo"

export const AuthSidebar = () => {
    return (
        <div className=" w-2/5 bg-[url('/images/auth-sidebar-bg.jpg')] bg-cover bg-center bg-no-repeat relative">
            <div className=" absolute top-0 left-0 h-full w-full bg-gradient-to-r from-black to-zinc-900/20  z-5">
                <div className=" p-6 text-white z-20">
                    <div className=" flex flex-col items-start">

                        <Logo color="white" href="/" />

                        <div className="flex flex-col space-y-4 mt-24 px-8">
                            <h1 className=" text-5xl font-extrabold">
                                Bridgeを始めよう
                            </h1>
                            <p className=" text-gray-300 font-light text-[22px]"> 
                                Bridgeは普段のオンライン授業をより良くすることを目標に作成したアプリです。グループモード、クイズ機能などこのアプリならではの機能が搭載されています。サインイン・サインアップしてBridgeを今すぐ始まましょう!
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}