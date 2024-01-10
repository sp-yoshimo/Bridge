import { SignUp } from "@clerk/nextjs";
import React from "react";

//Clerkによるサインアップページ
const SignUpPage = () => {
    return (
        <div className=" h-full w-full flex items-center justify-center" >
            <SignUp />
        </div>
    )
};

export default SignUpPage;
