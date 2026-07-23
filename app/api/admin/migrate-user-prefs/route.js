import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// One-time migration helper: adds the currency/monthStartDay columns to
// User on databases (like the hosted Turso instance) that `prisma migrate
// deploy` can't reach from this environment. Safe to call more than once.
async function runMigration(request) {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({error: 'not logged in'}, {status: 401});

    const results = {};
    for (const stmt of [
        "ALTER TABLE User ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD'",
        "ALTER TABLE User ADD COLUMN monthStartDay INTEGER NOT NULL DEFAULT 1",
    ]) {
        try {
            await prisma.$executeRawUnsafe(stmt);
            results[stmt] = 'applied';
        } catch (error) {
            results[stmt] = String(error.message || error).includes('duplicate column')
                ? 'already applied'
                : `error: ${error.message}`;
        }
    }
    return NextResponse.json({results});
}

export const POST = runMigration;
export const GET = runMigration;
