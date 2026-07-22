import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request) {
    try {
        // take token from cookie
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({user: null});
        }

        // verify token
        const payload = verifyToken(token);

        // use userid to get the user
        const user = await prisma.user.findUnique({
            where: {id:payload.userId},
            select: {id:true, email:true, name:true}
        });

        return NextResponse.json({user});
    } catch (error) {
        // if token being change of expire then set it to null
        return NextResponse.json({user:null});
    }
}