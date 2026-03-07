import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: mark a habit as done for a given date
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date } = await req.json(); // "YYYY-MM-DD"

    const habit = await prisma.habit.findUnique({ where: { id: params.id } });
    if (!habit || habit.userId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const log = await prisma.habitLog.upsert({
        where: { habitId_date: { habitId: params.id, date } },
        create: { habitId: params.id, date },
        update: {},
    });

    return NextResponse.json(log, { status: 201 });
}

// DELETE: un-mark a habit for a given date
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date } = await req.json();

    const habit = await prisma.habit.findUnique({ where: { id: params.id } });
    if (!habit || habit.userId !== session.user.id) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.habitLog.deleteMany({
        where: { habitId: params.id, date },
    });

    return NextResponse.json({ success: true });
}
