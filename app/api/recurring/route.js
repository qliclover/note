import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'not logged in' }, { status: 401 });

    const { name, amount, cycle, nextDate } = await request.json();
    if (!name || !amount) return NextResponse.json({ error: 'name and amount are required' }, { status: 400 });

    const recurring = await prisma.recurring.create({
      data: {
        name,
        amount: parseFloat(amount),
        cycle: cycle || 'monthly',
        nextDate: nextDate || null,
        userId,
      },
    });
    return NextResponse.json({ recurring });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'not logged in' }, { status: 401 });

    const recurrings = await prisma.recurring.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ recurrings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}