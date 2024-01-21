"use client"

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Users } from "lucide-react";
import { Online } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface TeamCardProps {
    name: string;
    teamId: string,
    authorName: string,
    imageUrl: string;
    description?: string | null,
    membersLength: number,
    authorImageUrl: string,
    online: Online | null
};


//ホーム画面のチーム一覧のカード
export const TeamCard = ({
    name,
    teamId,
    authorName,
    imageUrl,
    description,
    membersLength,
    authorImageUrl,
    online
}: TeamCardProps) => {

    const router = useRouter();



    return (
        <Card
            className=" overflow-hidden h-[200px] p-0 group cursor-pointer hover:scale-[1.01] duration-150">
            <Link
                href={`/dashboard/teams/${teamId}`}
            >
                <CardHeader className="h-[150px] p-0">
                    <div className=" relative h-[150px] w-full">
                        <Image
                            src={imageUrl}
                            fill
                            alt="teamImage"
                            className=" object-cover"
                        />
                        <div className=" absolute top-0 left-0 w-full h-full bg-black opacity-75 dark:opacity-85" />
                        <div className=" absolute  top-0 left-0 w-full p-4">
                            <CardTitle className="text-white font-extrabold text-4xl">
                                {name}
                            </CardTitle>
                            <p className=" text-white mt-2 font-light w-full text-sm truncate">
                                {description || ""}
                            </p>
                        </div>
                        {online && online.status !== "NONE" && (
                            <div className="absolute top-0 right-0 p-3">
                                <Badge className=" bg-sky-500 hover:bg-sky-500  text-white">
                                    オンライン
                                </Badge>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className=" p-0">
                    <div className=" flex justify-between p-2">
                        <div className=" flex items-center gap-x-1 text-sm">
                            <div className=" relative w-6 h-6 rounded-full">
                                <Image
                                    src={authorImageUrl}
                                    fill
                                    alt="author-icon"
                                    className=" object-cover rounded-full"
                                />
                            </div>
                            <p>
                                {authorName}
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-x-1">
                                <Users className=" w-4 h-4" />
                                <p>
                                    {membersLength}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Link>
        </Card>
    )
}