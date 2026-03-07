import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const habits = await (prisma as any).habit.findMany({
            where: { userId: user.id },
            include: {
                logs: {
                    orderBy: { date: "desc" },
                },
            },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(habits);
    } catch (err) {
        console.error("[GET /api/habits]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const { name, emoji, color } = await req.json();

        if (!name?.trim()) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const habit = await (prisma as any).habit.create({
            data: {
                name: name.trim(),
                emoji: emoji || "⭐",
                color: color || "#6366f1",
                userId: user.id,
            },
            include: { logs: true },
        });

        return NextResponse.json(habit, { status: 201 });
    } catch (err) {
        console.error("[POST /api/habits]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
