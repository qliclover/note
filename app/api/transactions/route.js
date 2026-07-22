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
        const {amount, type, note, categoryId} = await request.json();

        // verify
        if (!amount || !type) {
            return NextResponse.json({error: 'amount and type are required'}, {status400});
        }

        // push 
        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                type,
                note,
                userId,
                categoryId: categoryId ? parseInt(categoryId) : null,
            }
        });
        return NextResponse.json({transaction});
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

        const transactions = await prisma.transaction.findMany({
            where: {userId},
            orderBy: {date: 'desc'},
            include: {category: true},
        });

        return NextResponse.json({transactions});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status:500});
    }
}