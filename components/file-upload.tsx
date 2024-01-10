"use client";


import { UploadDropzone } from "@/lib/uploadthing";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { useToast } from "./ui/use-toast";

interface FileUploadProps {
    onChange: (url?: string) => void;
    endpoint: keyof typeof ourFileRouter;
    onComplete?: () => void
};

//ファイルアップロード用のコンポーネント
export const FileUpload = ({
    onChange,
    endpoint,
    onComplete
}: FileUploadProps) => {

    const { toast } = useToast();

    return (
        <UploadDropzone
            className=" w-full"
            endpoint={endpoint}
            onClientUploadComplete={(res) => {
                onChange(res?.[0].url);
                if (onComplete) {
                    onComplete()
                }
            }}
            onUploadError={(error: Error) => {
                toast({
                    title: "エラーが発生しました",
                    description: `エラー内容: ${error}`
                })
            }}
        />
    )
}