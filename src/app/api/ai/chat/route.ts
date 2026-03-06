import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { jsonSchema } from "@ai-sdk/ui-utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

// Hardcoded JSON Schema for a single task item — avoids Zod <-> OpenAI incompatibility
const taskItemJsonSchema = {
    type: "object" as const,
    properties: {
        title: { type: "string" as const },
        description: { type: "string" as const },
        estimatedDaysFromNow: { type: "number" as const },
        labels: { type: "string" as const }
    },
    required: ["title", "description", "estimatedDaysFromNow", "labels"],
    additionalProperties: false
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new Response("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        const { messages, goalId } = await req.json();

        // Fetch user's current tasks and goals for AI context
        const [userTasks, userGoals] = await Promise.all([
            prisma.task.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 50,
                select: {
                    id: true, title: true, description: true,
                    status: true, deadline: true, labels: true,
                    goal: { select: { title: true } }
                }
            }),
            prisma.goal.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, title: true, description: true,
                    deadline: true,
                    _count: { select: { tasks: true } }
                }
            })
        ]);

        const today = new Date();
        const todayString = today.toLocaleDateString("ru-RU", {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const statusLabel: Record<string, string> = {
            BACKLOG: 'В бэклоге', IN_PROGRESS: 'В процессе', DONE: 'Выполнено'
        };

        const taskContext = userTasks.length === 0
            ? 'У пользователя пока нет задач.'
            : userTasks.map(t => {
                const parts = [`- [ID:${t.id}] [${statusLabel[t.status] ?? t.status}] ${t.title}`];
                if (t.goal) parts.push(`  (Цель: ${t.goal.title})`);
                if (t.deadline) parts.push(`  (Дедлайн: ${new Date(t.deadline).toLocaleDateString('ru-RU')})`);
                if (t.description) parts.push(`  ${t.description}`);
                return parts.join('\n');
            }).join('\n');

        const goalContext = userGoals.length === 0
            ? 'У пользователя пока нет целей.'
            : userGoals.map(g => {
                let s = `- [ID:${g.id}] ${g.title} (задач: ${g._count.tasks})`;
                if (g.deadline) s += ` | дедлайн: ${new Date(g.deadline).toLocaleDateString('ru-RU')}`;
                if (g.description) s += `\n  ${g.description}`;
                return s;
            }).join('\n');

        const activeGoalText = goalId
            ? `User is inside Goal context (ID: ${goalId}). Use create_single_task to add tasks to this goal.`
            : `User is not inside any specific Goal context.`;

        const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: `Ты эксперт-ассистент по продуктивности. Ты знаешь ВСЕ задачи и цели пользователя.
Текущая дата и время: ${todayString}.
${activeGoalText}

## ЦЕЛИ ПОЛЬЗОВАТЕЛЯ:
${goalContext}

## ЗАДАЧИ ПОЛЬЗОВАТЕЛЯ (используй ID когда нужно изменить задачу):
${taskContext}

ПРАВИЛА:
- Общаешься на любом языке, которым пишет пользователь.
- Для создания задач — используй create_single_task или create_goal_with_tasks.
- Для изменения существующей задачи — используй update_task с правильным ID из списка выше.
- Для УДАЛЕНИЯ задачи — используй delete_task с массивом taskIds. Можешь удалять несколько сразу.
- Для УДАЛЕНИЯ цели — используй delete_goal. Если пользователь хочет удалить задачи вместе с целью, передай deleteTasks: true.
- Для анализа доски — смотри все задачи и давай конкретные советы по приоритизации.
- Не просто перечисляй задачи текстом, реально вызывай функции!
- Для полей description и labels всегда указывай значение. Используй пустую строку "" если не указано.

ФОРМАТИРОВАНИЕ ОТВЕТОВ (ОЧЕНЬ ВАЖНО):
- НИКОГДА не показывай технические ID задач или целей пользователю — они только для твоего внутреннего использования.
- НИКОГДА не используй маркдаун для выделения текста: никаких звездочек (**bold**), решеток (### Заголовок) и прочих спецсимволов. Твой текст должен быть абсолютно чистым и выглядеть как обычное человеческое сообщение.
- Используй только эмодзи, перенос строки (Enter) и обычные списки с тире или цифрами.
- Когда перечисляешь задачи, пример красивого ответа:
  📋 Твои задачи:
  1. 📌 Build a Simple Next.js App — дедлайн 13 марта
  2. 📖 Прочитать документацию Next.js — дедлайн 9 марта
  
  Анализ:
  - Срочные задачи: Встреча в кафе SkyBlue имеет ближайший дедлайн.
- Будь лаконичен и дружелюбен. Не надо описывать каждое поле задачи — только название и дедлайн если он есть.
- Статус показывай только если пользователь спросил или если это важно.`,
            messages,
            tools: {
                create_single_task: tool({
                    description: "Creates one or more specific tasks in the database.",
                    parameters: jsonSchema<{ tasks: Array<{ title: string; description: string; estimatedDaysFromNow: number; labels: string }> }>({
                        type: "object",
                        properties: {
                            tasks: {
                                type: "array",
                                items: taskItemJsonSchema
                            }
                        },
                        required: ["tasks"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ tasks }) => {
                        const tasksToCreate = (tasks as any[]).map((t) => {
                            let deadlineDate = null;
                            if (typeof t.estimatedDaysFromNow === 'number' && t.estimatedDaysFromNow > 0) {
                                const d = new Date();
                                d.setDate(d.getDate() + t.estimatedDaysFromNow);
                                deadlineDate = d.toISOString().split('T')[0];
                            }
                            return {
                                title: t.title,
                                description: t.description || null,
                                deadline: deadlineDate,
                                status: "BACKLOG",
                                labels: t.labels || "ai-generated",
                                userId: user.id,
                                goalId: goalId || null
                            };
                        });

                        const created = await prisma.task.createMany({ data: tasksToCreate });
                        return {
                            success: true,
                            message: `Successfully created ${created.count} tasks. Tell the user it's done.`
                        };
                    }
                }),

                update_task: tool({
                    description: "Updates an existing task by ID. Use this to change a task's title, description, deadline, status, or labels.",
                    parameters: jsonSchema<{
                        taskId: string;
                        title: string;
                        description: string;
                        deadline: string;
                        status: string;
                        labels: string;
                    }>({
                        type: "object",
                        properties: {
                            taskId: { type: "string" },
                            title: { type: "string" },
                            description: { type: "string" },
                            deadline: { type: "string" },
                            status: { type: "string" },
                            labels: { type: "string" }
                        },
                        required: ["taskId", "title", "description", "deadline", "status", "labels"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ taskId, title, description, deadline, status, labels }) => {
                        // Security: verify this task belongs to the user
                        const existing = await prisma.task.findFirst({
                            where: { id: taskId, userId: user.id }
                        });
                        if (!existing) {
                            return { error: "Task not found or access denied." };
                        }

                        const updated = await prisma.task.update({
                            where: { id: taskId },
                            data: {
                                title: title || existing.title,
                                description: description !== "" ? description : existing.description,
                                deadline: deadline !== "" ? deadline : existing.deadline,
                                status: status !== "" ? status : existing.status,
                                labels: labels !== "" ? labels : existing.labels,
                            }
                        });
                        return {
                            success: true,
                            message: `Task "${updated.title}" has been updated. Tell the user the change is saved.`
                        };
                    }
                }),

                create_goal_with_tasks: tool({
                    description: "Creates a macro-level Goal and automatically nests a list of child tasks inside it.",
                    parameters: jsonSchema<{ goalTitle: string; goalDescription: string; goalDeadlineDaysFromNow: number; tasks: Array<{ title: string; description: string; estimatedDaysFromNow: number; labels: string }> }>({
                        type: "object",
                        properties: {
                            goalTitle: { type: "string" },
                            goalDescription: { type: "string" },
                            goalDeadlineDaysFromNow: { type: "number" },
                            tasks: {
                                type: "array",
                                items: taskItemJsonSchema
                            }
                        },
                        required: ["goalTitle", "goalDescription", "goalDeadlineDaysFromNow", "tasks"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ goalTitle, goalDescription, goalDeadlineDaysFromNow, tasks }) => {
                        if (goalId) {
                            return { error: "Already inside a Goal context, cannot nest goals." };
                        }

                        let goalDeadline = null;
                        if (typeof goalDeadlineDaysFromNow === 'number' && goalDeadlineDaysFromNow > 0) {
                            const d = new Date();
                            d.setDate(d.getDate() + goalDeadlineDaysFromNow);
                            goalDeadline = d.toISOString().split('T')[0];
                        }

                        const newGoal = await prisma.goal.create({
                            data: {
                                title: goalTitle,
                                description: goalDescription || null,
                                deadline: goalDeadline,
                                userId: user.id
                            }
                        });

                        const tasksToCreate = (tasks as any[]).map((t) => {
                            let deadlineDate = null;
                            if (typeof t.estimatedDaysFromNow === 'number') {
                                const d = new Date();
                                d.setDate(d.getDate() + t.estimatedDaysFromNow);
                                deadlineDate = d.toISOString().split('T')[0];
                            }
                            return {
                                title: t.title,
                                description: t.description || null,
                                deadline: deadlineDate,
                                status: "BACKLOG",
                                labels: t.labels || "ai-generated",
                                userId: user.id,
                                goalId: newGoal.id
                            };
                        });

                        const created = await prisma.task.createMany({ data: tasksToCreate });
                        return {
                            success: true,
                            message: `Successfully created Goal "${goalTitle}" with ${created.count} nested tasks. Tell the user it's done.`
                        };
                    }
                }),

                delete_task: tool({
                    description: "Deletes one or more tasks by their IDs. Use this when the user asks to delete or remove specific tasks.",
                    parameters: jsonSchema<{ taskIds: string[] }>({
                        type: "object",
                        properties: {
                            taskIds: { type: "array", items: { type: "string" } }
                        },
                        required: ["taskIds"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ taskIds }) => {
                        // Security: only delete tasks belonging to this user
                        const deleted = await prisma.task.deleteMany({
                            where: { id: { in: taskIds }, userId: user.id }
                        });
                        return {
                            success: true,
                            message: `Deleted ${deleted.count} task(s). Tell the user it's done.`
                        };
                    }
                }),

                delete_goal: tool({
                    description: "Deletes a goal by its ID. If deleteTasks is true, also deletes all tasks belonging to that goal. Use this when user asks to delete a goal.",
                    parameters: jsonSchema<{ goalId: string; deleteTasks: boolean }>({
                        type: "object",
                        properties: {
                            goalId: { type: "string" },
                            deleteTasks: { type: "boolean" }
                        },
                        required: ["goalId", "deleteTasks"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ goalId: targetGoalId, deleteTasks: shouldDeleteTasks }) => {
                        // Security: verify goal belongs to user
                        const existing = await prisma.goal.findFirst({
                            where: { id: targetGoalId, userId: user.id }
                        });
                        if (!existing) {
                            return { error: "Goal not found or access denied." };
                        }
                        if (shouldDeleteTasks) {
                            await prisma.task.deleteMany({ where: { goalId: targetGoalId, userId: user.id } });
                        }
                        await prisma.goal.delete({ where: { id: targetGoalId } });
                        return {
                            success: true,
                            message: `Goal "${existing.title}" deleted${shouldDeleteTasks ? " along with all its tasks" : ""}. Tell the user it's done.`
                        };
                    }
                })
            },
            maxSteps: 3,
        });

        return result.toTextStreamResponse();


    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return new Response("Failed to generate plan", { status: 500 });
    }
}
