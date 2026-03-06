import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const task = await prisma.task.findFirst({
            where: { id, userId: user.id }
        });
        if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

        // Generate subtasks via OpenAI
        const completion = await openaiClient.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a productivity assistant. Generate 4–6 specific, actionable subtask checklist items for the given task. 
Return ONLY a JSON array of objects like: [{"text": "...", "done": false}, ...]
Be concise and specific. No explanations, just JSON.`
                },
                {
                    role: "user",
                    content: `Task: "${task.title}"${task.description ? `\nDescription: ${task.description}` : ""}`
                }
            ],
            temperature: 0.7,
            max_tokens: 400
        });

        const raw = completion.choices[0].message.content?.trim() ?? "[]";

        // Parse JSON safely
        let checklist: Array<{ text: string; done: boolean }>;
        try {
            const cleaned = raw.replace(/```json|```/g, "").trim();
            checklist = JSON.parse(cleaned);
        } catch {
            checklist = [{ text: "Review the task details", done: false }];
        }

        // Save to DB
        const updated = await prisma.task.update({
            where: { id },
            data: { checklist: JSON.stringify(checklist) }
        });

        return NextResponse.json({
            checklist,
            taskId: updated.id
        });

    } catch (error) {
        console.error("Error generating subtasks:", error);
        return NextResponse.json({ error: "Failed to generate subtasks" }, { status: 500 });
    }
}
