import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(request, {params}) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({error: 'not logged in'}, {status: 401});

        const {id} = await params;
        const result = await prisma.budget.deleteMany({
            where: {id: parseInt(id), userId},
        });
        if (result.count === 0) return NextResponse.json({error: 'not found'}, {status: 404});
        return NextResponse.json({ok: true});
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
        const {amount} = await request.json();
        const result = await prisma.budget.updateMany({
            where: {id: parseInt(id), userId},
            data: {amount: parseFloat(amount)},
        });
        if (result.count === 0) return NextResponse.json({error: 'not found'}, {status: 404});
        return NextResponse.json({ok: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500});
    }
}
