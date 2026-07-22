import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(request) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({error: 'not logged in'}, {status: 401});

        const {categoryId, amount} = await request.json();
        if (!categoryId || !amount) return NextResponse.json({error: 'category and amount are required'}, {status: 400});

        const budget = await prisma.budget.create({
            data: {
                amount: parseFloat(amount),
                categoryId: parseInt(categoryId),
                userId,
            }
        });
        return NextResponse.json({budget});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500});
    }
}

export async function GET(request) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({error: 'not logged in'}, {status: 401});

        const budgets = await prisma.budget.findMany({
            where: {userId},
            include: {category: true},
            orderBy: {id: 'asc'},
        });
        return NextResponse.json({budgets});
    } catch(error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500});
    }
}