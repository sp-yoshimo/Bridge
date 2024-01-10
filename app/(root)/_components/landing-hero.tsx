"use client"


import React, { useEffect, useState } from "react";

const LandingHero = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true)
    }, []);

    if (!isMounted) {
        return null
    }

    return (
        <div className=" relative h-full p-3 md:p-5">

            <div className=" flex justify-center pt-20">
                <div className=" flex flex-col items-center">
                    <h1 className=" font-extrabold text-2xl md:text-3xl lg:text-6xl text-center">
                        オンライン授業のためのアプリケーション
                    </h1>
                    <h1 className=" text-3xl md:text-4xl lg:text-7xl mt-3 font-extrabold bg-gradient-to-r from-sky-500 to-indigo-600 w-auto h-[200px] text-transparent bg-clip-text">
                        Bridge
                    </h1>
                </div>
            </div>
            <div className=" absolute bottom-0 md:-bottom-[200px] xl:-bottom-[500px] 2xl:-bottom-[700px]">
                <img
                    src={`/images/drawkit/5.png`}
                    alt="image"
                    className=" object-cover"
                />
            </div>

        </div>
    )
};

export default LandingHero;
