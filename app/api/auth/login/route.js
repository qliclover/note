import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {verifyPassword, signToken} from "@/lib/auth";

export async function POST(request) {
    try {
        // receive data
        const {email, password} = await request.json();

        // verify
        if (!email || !password) {
            return NextResponse.json({error: 'email and password must fill'}, {status: 400});
        }

        // find user
        const user = await prisma.user.findUnique({where: {email}});
        if (!user) {
            return NextResponse.json({error: 'email or password is incorrect'}, {status: 401});
        }

        // compare password
        const ok = await verifyPassword(password, user.password);
        if (!ok) {
            return NextResponse.json({error: 'email or password is incorrect'}, {status: 401});
        }

        // give token
        const token = signToken({userId:user.id})

        // response
        const response = NextResponse.json({
            user: {id:user.id, email:user.email, name:user.name}
        })

        // insert token
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge:60*60*24*7,
            path:'/' 
        })

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status:500})
    }
}