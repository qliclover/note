import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getUserIdFromRequest } from "@/lib/auth";

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
            select: {id:true, email:true, name:true, currency:true, monthStartDay:true}
        });

        return NextResponse.json({user});
    } catch (error) {
        // if token being change of expire then set it to null
        return NextResponse.json({user:null});
    }
}

export async function PUT(request) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({error: 'not logged in'}, {status: 401});

        const {currency, monthStartDay} = await request.json();
        const data = {};
        if (currency !== undefined) data.currency = currency;
        if (monthStartDay !== undefined) data.monthStartDay = parseInt(monthStartDay);

        const user = await prisma.user.update({
            where: {id: userId},
            data,
            select: {id:true, email:true, name:true, currency:true, monthStartDay:true},
        });
        return NextResponse.json({user});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500});
    }
}