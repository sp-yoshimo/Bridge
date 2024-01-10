"use client"

import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { PT_Sans } from "next/font/google"
import { cn } from "@/lib/utils";

interface LogoProps {
    size?: "default" | "sm",
    href?: string;
    color? : "black" | "white" | "default"
}

const font = PT_Sans({
    subsets: ["latin"],
    weight: "700",
})

//Logoコンポーネント
const Logo = ({
    size = "default",
    href,
    color = "default"
}: LogoProps) => {

    const router = useRouter();

    return (
        <div
            onClick={() => {
                if (href) {
                    router.push(href);
                }
            }}
            className=" flex items-center gap-x-2 cursor-pointer">
            <div className={cn(`
                relative
            `,
            size === "default" ? "w-8 h-8" : "w-5 h-5" ,
            )}>
                <Image
                    alt="logo"
                    fill
                    className=" object-contain"
                    src={`/dummy-logo.svg`}
                />
            </div>
            <p className={cn(
                `${font.className} font-extrabold`,
                size === "default" ? "text-2xl" : "text-lg",
                color === "default" ? ` text-primary` : `text-${color}`
            )}>
                Bridge
            </p>
        </div>
    )
};

export default Logo;
