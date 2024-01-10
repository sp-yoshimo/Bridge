import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(
    req: Request
) {
    try {


        //認証
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        };

        const profile = await db.profile.findUnique({
            where: {
                userId: userId
            }
        });

        if (!profile || !profile.id || !profile.isTeacher) {
            return new NextResponse("Unauthorized", { status: 401 })
        };

        //チームの作成
        const {
            name
        } = await req.json();

        if (!name) {
            return new NextResponse("Missing required Field", { status: 401 })
        };

        const team = await db.team.create({
            data: {
                name: name,
                authorId: profile.id,
                inviteCode: uuidv4(),
                members: {
                    create: {
                        profileId: profile.id,
                        role: "ADMIN"
                    }
                }
            },
            include:{
                members: true
            }
        });

        if (!team) {
            return new NextResponse("Internal Error", { status: 500 })
        };

        const Admin = team.members.find((member) => member.role === "ADMIN" );

        if(!Admin){
            return new NextResponse("Internal Error",{ status: 500 })
        }

        await db.team.update({
            where:{
                id: team.id
            },
            data:{
                online:{
                    create:{
                        authorId: Admin.id,
                    }
                }
            }
        })
        

        return NextResponse.json(team);

    } catch (error) {
        console.log("[TEAM_CREATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}