import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// add a transaction
export async function POST(request) {
    try {
        // confirm login
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({error: 'not logged in'}, {status:401});
        }

        // get data
        const {name, type, icon} = await request.json();

        // verify
        if (!name || !type) {
            return NextResponse.json({error: 'name and type are required'}, {status:400});
        }

        // push 
        const category = await prisma.category.create({
            data: {
                name,
                type,
                icon,
                userId
            }
        });
        return NextResponse.json({category});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500});
    }
}

// get user's transaction table
export async function GET(request) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({error: 'not logged in'}, {status:401});
        }

        const categories = await prisma.category.findMany({
            where: {userId},
            orderBy: {id: 'asc'},
        });

        return NextResponse.json({categories});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status:500});
    }
}