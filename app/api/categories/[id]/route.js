import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// DELETE category
export async function DELETE(request, {params}) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({error: 'not logged in'}, {status: 401});

    const {id} = await params;
    const categoryId = parseInt(id);

    // 1. set category to [no category]
    // 2. delete key
    await prisma.transaction.updateMany({
        where: {categoryId, userId},
        data: {categoryId: null},
    });

    // only delete user's category
    const result = await prisma.category.deleteMany({
        where: {id: categoryId, userId},
    });

    if (result.count === 0) return NextResponse.json({error: 'not found'}, {status: 404});
    return NextResponse.json({ok: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500});
    }
}

// PUT category
export async function PUT(request, {params}) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({error: 'not logged in'}, {status: 401});

        const {id} = await params;
        const categoryId = parseInt(id);
        const {name, icon, type} = await request.json();

        // only change user's category
        const result = await prisma.category.updateMany({
            where : {id: categoryId, userId},
            data: {name, icon, type},
        });
        if (result.count === 0) return NextResponse.json({error: 'not found'}, {status: 404});
        return NextResponse.json({ok: true});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'server error'}, {status: 500});
    }
}