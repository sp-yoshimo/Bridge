"use client"

import { FolderPlus, X } from "lucide-react";
import { useEffect, useState } from "react"


export const NotFound = ({
    searched = true,
}:{
    searched: boolean;
}) => {


    return(
        <div className="flex flex-col w-full h-full justify-center items-center">
            {searched && (
                <X className=" w-10 h-10 text-muted-foreground" />
            )}
            <div>
                {searched && (
                    <p className=" text-muted-foreground">
                        チームが見つかりませんでした
                    </p>
                )}
                {!searched && (
                    <p className=" text-muted-foreground">
                        チームがまだありません。
                    </p>
                )}
            </div>
        </div>
    )
}