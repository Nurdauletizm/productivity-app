import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: mark a habit as done for a given date
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { date } = await req.json();

        const habit = await (prisma as any).habit.findUnique({ where: { id } });
        if (!habit || habit.userId !== user.id) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const log = await (prisma as any).habitLog.upsert({
            where: { habitId_date: { habitId: id, date } },
            create: { habitId: id, date },
            update: {},
        });

        return NextResponse.json(log, { status: 201 });
    } catch (err) {
        console.error("[POST /api/habits/:id/log]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE: un-mark a habit for a given date
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { date } = await req.json();

        const habit = await (prisma as any).habit.findUnique({ where: { id } });
        if (!habit || habit.userId !== user.id) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        await (prisma as any).habitLog.deleteMany({
            where: { habitId: id, date },
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[DELETE /api/habits/:id/log]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
