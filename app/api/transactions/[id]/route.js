import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(request, {params}) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({error: 'not logged in'}, {status:401});
        }

        const {id} = await params;
        const transactionId = parseInt(id);

        // delete specific user's transaction
        const result = await prisma.transaction.deleteMany({
            where: {id: transactionId, userId},
        });

        if (result.count === 0) {
            return NextResponse.json({error: 'not found'}, {status: 404});
        }

        return NextResponse.json({ok: true});
    } catch(error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status:500});
    }
}

export async function GET(request, {params}) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({error: 'not logged in'}, {status: 401});

        const {id} = await params;
        const transaction = await prisma.transaction.findFirst({
            where: {id:parseInt(id), userId},
            include: {category: true},
        });
        if (!transaction) return NextResponse.json({error: 'not found'}, {status: 404});
        return NextResponse.json({transaction});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500});
    }
}

export async function PUT(request, {params}) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({error: 'not logged in'}, {status: 401});

        const {id} = await params;
        const {amount, type, note, categoryId} = await request.json();
        
        const result = await prisma.transaction.updateMany({
            where: {id: parseInt(id), userId},
            data: {
                amount: parseFloat(amount),
                type,
                note,
                categoryId: categoryId ? parseInt(categoryId) : null,
            },
        });
        if (result.count === 0) return NextResponse.json({error: 'not found'}, {status: 404});
        return NextResponse.json({ok: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500});
    }
}