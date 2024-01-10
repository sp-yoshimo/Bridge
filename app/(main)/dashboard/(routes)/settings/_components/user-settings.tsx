"use client"

import * as z from "zod"
import axios from "axios";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Profile } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useModal } from "@/hooks/use-modal";
import { FileUpload } from "@/components/file-upload";
import { Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";



//ユーザー設定ゾーン
const UserSettings = ({
    currentProfile
}: {
    currentProfile: Profile
}) => {

    const [isMounted, setIsMounted] = useState(false);
    const [name, setName] = useState(currentProfile.name);
    const [imageUrl, setImageUrl] = useState(currentProfile.imageUrl)
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingImage, setIsEditingImage] = useState(false);

    const { onOpen } = useModal();
    const { toast } = useToast()

    const router = useRouter();

    useEffect(() => {
        setIsMounted(true)
    }, []);

    if (!isMounted) {
        return null
    }


    //フォーム送信時の処理
    const onSubmit = async () => {
        try {

            setIsLoading(true)
            await axios.patch(`/api/profile/`,{
                name: name,
                imageUrl: imageUrl,
                profileId: currentProfile.id
            })

            toast({
                title: "プロフィールを更新しました"
            })

            router.refresh();

        } catch (error) {
            toast({
                title: "エラーが発生しました",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <div className=" flex justify-between items-center">
                <h3 className=" text-xl font-bold">
                    プロフィールの編集
                </h3>

                <Button
                    disabled={isLoading}
                    onClick={onSubmit}
                >
                    {isLoading ? (
                        <Loader2 className=" animate-spin" />
                    ) : (
                        <p>
                            保存
                        </p>
                    )}
                </Button>
            </div>

            <div className=" mt-8 space-y-8">
                <div>
                    <p className=" font-bold text-base mb-1">
                        ユーザーネーム
                    </p>
                    <Input
                        placeholder="ユーザーネームを入力"
                        defaultValue={name}
                        onChange={(e) => setName(e.target.value)}
                        className="focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                    />
                </div>

                <div>
                    <p className=" font-bold text-base mb-1">
                        アイコン画像
                    </p>
                    {imageUrl && !isEditingImage && (
                        <div className="p-5 flex items-center gap-x-5">
                            <div
                                onClick={() => onOpen("expandImageModal", { imageUrl })}
                                className=" relative w-20 h-20 cursor-pointer">
                                <Image
                                    src={imageUrl}
                                    alt="icon"
                                    fill
                                    className=" object-cover rounded-full"
                                />
                            </div>
                            <div
                                onClick={() => setIsEditingImage(true)}
                            >
                                <h1 className=" text-sky-500 hover:border-b hover:border-sky-500 cursor-pointer duration-100">
                                    画像を変える
                                </h1>
                            </div>
                        </div>
                    )}
                    {!imageUrl || (imageUrl && isEditingImage) && (
                        <div className="p-5 flex items-center relative">
                            <div
                                onClick={() => setIsEditingImage(false)}
                                className=" absolute top-5 right-2 bg-rose-500 rounded-full p-1 cursor-pointer">
                                <X className=" w-5 h-5 text-white" />
                            </div>
                            <div className=" w-full dark:border rounded-lg border-dotted border-zinc-500">
                                <FileUpload
                                    endpoint="initialProfileImage"
                                    onChange={(url) => {
                                        setImageUrl(url!)
                                        setIsEditingImage(false);
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>


            </div>
        </div>
    )
};

export default UserSettings;
