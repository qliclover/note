import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request) {
    try {
        // receive data from user           
        const {email, password, name}  = await request.json();

        // verify
        if (!email || !password) {
        return NextResponse.json({error: 'email and password must fill'}, {status: 400})
        }

        // check if email registed
        const existing = await prisma.user.findUnique({where: {email}})
        if (existing) {
        return NextResponse.json({error:'This email already registed'}, {status:409})
        }

        // convert password, create new User
        const hashed = await hashPassword(password);
        const user = await prisma.user.create({
            data: {email, password: hashed, name}
        })

        // give a token
        const token = signToken({userId: user.id});
        
        // response
        const response = NextResponse.json({
            user: {id:user.id, email: user.email, name:user.name}
        })

        // insert token
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })

        return response
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500})
    }
}
