import { SignIn } from "@clerk/nextjs";
import React from "react";

//Clerkによるサインインページ
const SignInPage = () => {
    return (
        <div className=" h-full w-full flex items-center justify-center">
            <SignIn />
        </div>
    )
};

export default SignInPage;
