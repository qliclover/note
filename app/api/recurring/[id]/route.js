import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(request, {params}) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({error: 'not logged in'}, {status: 401});

        const {id} = await params;
        const result = await prisma.recurring.deleteMany({
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
        const {name, amount, cycle, nextDate} = await request.json();
        const result = await prisma.recurring.updateMany({
            where: {id: parseInt(id), userId},
            data: {
                ...(name !== undefined && {name}),
                ...(amount !== undefined && {amount: parseFloat(amount)}),
                ...(cycle !== undefined && {cycle}),
                ...(nextDate !== undefined && {nextDate}),
            },
        });
        if (result.count === 0) return NextResponse.json({error: 'not found'}, {status: 404});
        return NextResponse.json({ok: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500});
    }
}
