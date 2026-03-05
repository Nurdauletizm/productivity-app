import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const goal = await prisma.goal.findUnique({
            where: { id, userId: session.user.id },
        });

        if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

        return NextResponse.json(goal);
    } catch (error) {
        console.error("Error fetching goal:", error);
        return NextResponse.json({ error: "Failed to fetch goal" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, description, deadline } = body;

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (deadline !== undefined) updateData.deadline = deadline;

        const updatedGoal = await prisma.goal.update({
            where: { id, userId: session.user.id },
            data: updateData,
        });

        return NextResponse.json(updatedGoal);
    } catch (error) {
        console.error("Error updating goal:", error);
        return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        // The schema uses onDelete: Cascade for User references, but Goal to Task is SetNull.
        await prisma.goal.delete({
            where: { id, userId: session.user.id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting goal:", error);
        return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
    }
}
