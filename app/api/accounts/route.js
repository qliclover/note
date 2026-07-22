import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'not logged in' }, { status: 401 });

    const { name, type, balance } = await request.json();
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const account = await prisma.account.create({
      data: {
        name,
        type: type || 'bank',
        balance: balance ? parseFloat(balance) : 0,
        userId,
      },
    });
    return NextResponse.json({ account });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'not logged in' }, { status: 401 });

    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}