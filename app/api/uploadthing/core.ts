import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

//未ログイン判定
const handleAuth = () => {
    const { userId } = auth();
    if (!userId) throw new Error("Unauthorized")
    return { userId }
}


export const ourFileRouter = {


    //初期設定画面でのアイコン画像アップロード
    initialProfileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => { }),

    //チーム画像アップロード
    teamImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
        .middleware(() => handleAuth())
        .onUploadComplete(() => {})


} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;