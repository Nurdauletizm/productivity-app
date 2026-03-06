import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const goals = await prisma.goal.findMany({
            where: { userId: user.id },
            include: {
                tasks: true,
            },
            orderBy: { createdAt: "desc" },
        });

        // Calculate progress for each goal
        const goalsWithProgress = goals.map((goal: any) => {
            const tasksTotal = goal.tasks.length;
            const tasksCompleted = goal.tasks.filter((t: any) => t.status === "DONE").length;

            return {
                id: goal.id,
                title: goal.title,
                description: goal.description,
                deadline: goal.deadline,
                tasksTotal,
                tasksCompleted,
            };
        });

        return NextResponse.json(goalsWithProgress);
    } catch (error) {
        console.error("Error fetching goals:", error);
        return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { title, description, deadline } = body;

        const newGoal = await prisma.goal.create({
            data: {
                title,
                description,
                deadline,
                userId: user.id,
            },
        });

        return NextResponse.json(newGoal, { status: 201 });
    } catch (error) {
        console.error("Error creating goal:", error);
        return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
    }
}
