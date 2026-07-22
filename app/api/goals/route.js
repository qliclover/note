import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// add a new goal
export async function POST(request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'not logged in' }, { status: 401 });

    const { name, target, saved, targetDate } = await request.json();
    if (!name || !target) return NextResponse.json({ error: 'name and target are required' }, { status: 400 });

    const goal = await prisma.goal.create({
      data: {
        name,
        target: parseFloat(target),
        saved: saved ? parseFloat(saved) : 0,
        targetDate: targetDate || null,
        userId,
      },
    });
    return NextResponse.json({ goal });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

// list out my goal
export async function GET(request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ error: 'not logged in' }, { status: 401 });

    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { id: 'asc' },
    });
    return NextResponse.json({ goals });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}