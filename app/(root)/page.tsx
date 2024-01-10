import { auth } from "@clerk/nextjs";
import React from "react";
import LandingNavbar from "./_components/landing-navbar";
import LandingHero from "./_components/landing-hero";

//未ログイン時に表示させるランディングページ
const LandingPage = () => {

  const { userId } = auth();

  const isLogin = userId ? true: false

  return (
    <div className=" w-full h-full flex flex-col overflow-hidden">

      <div className=" h-16 border-b">
        <LandingNavbar
          isLogin={isLogin}
        />
      </div>

      <div className=" flex-grow">
        <LandingHero />
      </div>

    </div>
  )
};

export default LandingPage;
