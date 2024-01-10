import PusherServer from "pusher"
import PusherClient from "pusher-js"


//pusherを利用してリアルタイムを導入

export const pusherServer = new PusherServer({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    secret:process.env.PUSHER_SECRET!,
    cluster:"ap3",
    useTLS: true,
})


export const pusherClient = new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
    {
        cluster: "ap3"
    }
)