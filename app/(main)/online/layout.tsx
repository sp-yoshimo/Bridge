import { RoomContext } from "@livekit/components-react";
import React from "react";

const OnlineLayout = ({
    children
}: {
    children: React.ReactNode
}) => {
    return (
        <div className=" w-full h-full overflow-hidden">
            {children}
        </div>
    )
};

export default OnlineLayout;
