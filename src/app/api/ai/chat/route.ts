import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { jsonSchema } from "@ai-sdk/ui-utils";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export const maxDuration = 30;

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Hardcoded JSON Schema for a single task item
const taskItemJsonSchema = {
    type: "object" as const,
    properties: {
        title: { type: "string" as const },
        description: { type: "string" as const },
        deadlineIso: { type: "string" as const, description: "ISO 8601 string e.g. '2026-03-08T11:00:00Z'. Include time if user provided it." },
        labels: { type: "string" as const }
    },
    required: ["title", "description", "deadlineIso", "labels"],
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

        const { messages, goalId, localTimeStr } = await req.json();

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
            }),
        ]);

        // Fetch habits separately so a Prisma client mismatch doesn't break the whole chat
        let userHabits: any[] = [];
        try {
            userHabits = await (prisma as any).habit.findMany({
                where: { userId: user.id },
                include: { logs: { orderBy: { date: 'desc' }, take: 30 } },
                orderBy: { createdAt: 'asc' }
            });
        } catch {
            // habit table not yet available in this environment — skip
        }

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
            ? `Пользователь находится внутри контекста Цели (ID: ${goalId}). Используй create_single_task чтобы добавить задачи в эту цель.`
            : `Пользователь не находится внутри конкретной Цели.`;

        const todayDateStr = new Date().toISOString().split('T')[0];
        const habitContext = userHabits.length === 0
            ? 'У пользователя пока нет привычек.'
            : userHabits.map((h: any) => {
                const logDates = new Set(h.logs.map((l: any) => l.date));
                const doneToday = logDates.has(todayDateStr);
                let streak = 0;
                const d = new Date();
                while (true) {
                    const str = d.toISOString().split('T')[0];
                    if (logDates.has(str)) { streak++; d.setDate(d.getDate() - 1); }
                    else break;
                }
                return `- [ID:${h.id}] ${h.emoji} ${h.name} | стрик: ${streak} дней | сегодня: ${doneToday ? 'выполнено ✅' : 'не выполнено ❌'}`;
            }).join('\n');

        const currentTimeString = localTimeStr || new Date().toLocaleString('ru-RU');

        const result = await streamText({
            model: openai('gpt-4o-mini'),
            system: `Ты эксперт-ассистент по продуктивности в приложении Nizmix. Ты знаешь ВСЕ задачи, цели и привычки пользователя.
ТЕКУЩЕЕ ТОЧНОЕ МЕСТНОЕ ВРЕМЯ ПОЛЬЗОВАТЕЛЯ: ${currentTimeString}.
Обязательно используй это время для расчета "сегодня", "завтра" и всех дедлайнов.
${activeGoalText}

## ЦЕЛИ ПОЛЬЗОВАТЕЛЯ:
${goalContext}

## ЗАДАЧИ ПОЛЬЗОВАТЕЛЯ (используй ID когда нужно изменить задачу):
${taskContext}

## ПРИВЫЧКИ ПОЛЬЗОВАТЕЛЯ (streak tracker):
${habitContext}

ПРАВИЛА:
- Общаешься на любом языке, которым пишет пользователь.
- Для создания новых задач — используй create_single_task.
- Если создание целей и НОВЫХ задач — используй create_goal_with_tasks.
- ВАЖНО: Если пользователь просит добавить СУЩЕСТВУЮЩИЕ задачи в новую цель: 1) вызови create_goal, 2) затем вызови update_task для каждой существующей задачи, передав goalId из шага 1. НЕ ИСПОЛЬЗУЙ create_goal_with_tasks для существующих задач!
- Для изменения задачи (дедлайн, перенос в цель) — используй update_task с правильным ID.
- Для изменения цели (название, дедлайн, описание) — используй update_goal с правильным ID.
- Для УДАЛЕНИЯ задачи — используй delete_task с массивом taskIds. Можешь удалять несколько сразу.
- Для УДАЛЕНИЯ цели — используй delete_goal.
- Для привычек — используй create_habit (создать), toggle_habit_today (отметить/снять отметку), delete_habit (удалить).
- Для генерации подзадач (чеклиста) — используй generate_subtasks с ID задачи.
- Для дат (deadlineIso) всегда передавай точный ISO 8601 формат. Если пользователь указал время (например 11:00), обязательно включи его в строку (например "2026-03-08T11:00:00.000Z").
- Для анализа доски — смотри все задачи и давай конкретные советы по приоритизации.
- Не просто перечисляй задачи текстом, реально вызывай функции!
- Поля description, labels, deadlineIso — обязательны. Используй пустую строку "" если значения нет.

ФОРМАТИРОВАНИЕ ОТВЕТОВ (ОЧЕНЬ ВАЖНО):
- НИКОГДА не показывай технические ID задач или целей пользователю — они только для твоего внутреннего использования.
- Обязательно используй Markdown (жирный текст, списки) для структурирования ответа, чтобы его было удобно читать.
- Используй эмодзи.
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
                    description: "Создаёт одну или несколько задач в базе данных.",
                    parameters: jsonSchema<{ tasks: Array<{ title: string; description: string; deadlineIso: string; labels: string }> }>({
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
                            let deadlineDate = t.deadlineIso ? new Date(t.deadlineIso).toISOString() : null;
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
                            message: `Создано ${created.count} задач(и). Сообщи пользователю что готово.`
                        };
                    }
                }),

                update_task: tool({
                    description: "Обновляет существующую задачу по ID. Изменяет название, описание, дедлайн, статус, метки или привязку к цели.",
                    parameters: jsonSchema<{
                        taskId: string;
                        title: string;
                        description: string;
                        deadlineIso: string;
                        status: string;
                        labels: string;
                        goalId: string;
                    }>({
                        type: "object",
                        properties: {
                            taskId: { type: "string" },
                            title: { type: "string" },
                            description: { type: "string" },
                            deadlineIso: { type: "string", description: "ISO 8601 формат, например '2026-03-08T11:00:00Z'. Включай время если указано." },
                            status: { type: "string" },
                            labels: { type: "string" },
                            goalId: { type: "string", description: "ID цели для привязки задачи" }
                        },
                        required: ["taskId", "title", "description", "deadlineIso", "status", "labels", "goalId"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ taskId, title, description, deadlineIso, status, labels, goalId: newGoalId }) => {
                        const existing = await prisma.task.findFirst({
                            where: { id: taskId, userId: user.id }
                        });
                        if (!existing) {
                            return { error: "Задача не найдена или нет доступа." };
                        }

                        let parsedDeadline = existing.deadline;
                        if (deadlineIso && deadlineIso !== "") {
                            parsedDeadline = new Date(deadlineIso).toISOString();
                        }

                        const updated = await prisma.task.update({
                            where: { id: taskId },
                            data: {
                                title: title || existing.title,
                                description: description !== "" ? description : existing.description,
                                deadline: parsedDeadline,
                                status: status !== "" ? status : existing.status,
                                labels: labels !== "" ? labels : existing.labels,
                                goalId: newGoalId !== "" ? newGoalId : existing.goalId
                            }
                        });
                        return {
                            success: true,
                            message: `Задача "${updated.title}" обновлена.`
                        };
                    }
                }),

                create_goal: tool({
                    description: "Создаёт новую Цель. Возвращает ID созданной цели. Используй когда нужно создать пустую цель или перед привязкой существующих задач.",
                    parameters: jsonSchema<{ goalTitle: string; goalDescription: string; goalDeadlineIso: string }>({
                        type: "object",
                        properties: {
                            goalTitle: { type: "string" },
                            goalDescription: { type: "string" },
                            goalDeadlineIso: { type: "string", description: "ISO 8601 формат или пустая строка" }
                        },
                        required: ["goalTitle", "goalDescription", "goalDeadlineIso"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ goalTitle, goalDescription, goalDeadlineIso }) => {
                        const newGoal = await prisma.goal.create({
                            data: {
                                title: goalTitle,
                                description: goalDescription || null,
                                deadline: goalDeadlineIso ? new Date(goalDeadlineIso).toISOString() : null,
                                userId: user.id
                            }
                        });
                        return {
                            success: true,
                            goalId: newGoal.id,
                            message: `Цель "${goalTitle}" создана. ID: ${newGoal.id}.`
                        };
                    }
                }),

                update_goal: tool({
                    description: "Обновляет существующую цель по ID. Изменяет название, описание или дедлайн цели.",
                    parameters: jsonSchema<{ goalId: string; title: string; description: string; deadlineIso: string }>({
                        type: "object",
                        properties: {
                            goalId: { type: "string" },
                            title: { type: "string", description: "Новое название цели или пустая строка чтобы не менять" },
                            description: { type: "string", description: "Новое описание или пустая строка чтобы не менять" },
                            deadlineIso: { type: "string", description: "Новый дедлайн в ISO 8601 формате или пустая строка чтобы не менять" }
                        },
                        required: ["goalId", "title", "description", "deadlineIso"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ goalId: targetGoalId, title, description, deadlineIso }) => {
                        const existing = await prisma.goal.findFirst({
                            where: { id: targetGoalId, userId: user.id }
                        });
                        if (!existing) {
                            return { error: "Цель не найдена или нет доступа." };
                        }

                        let parsedDeadline = existing.deadline;
                        if (deadlineIso && deadlineIso !== "") {
                            parsedDeadline = new Date(deadlineIso).toISOString();
                        }

                        const updated = await prisma.goal.update({
                            where: { id: targetGoalId },
                            data: {
                                title: title || existing.title,
                                description: description !== "" ? description : existing.description,
                                deadline: parsedDeadline
                            }
                        });
                        return {
                            success: true,
                            message: `Цель "${updated.title}" обновлена.`
                        };
                    }
                }),

                create_goal_with_tasks: tool({
                    description: "Создаёт цель и автоматически вкладывает в неё новые задачи.",
                    parameters: jsonSchema<{ goalTitle: string; goalDescription: string; goalDeadlineIso: string; tasks: Array<{ title: string; description: string; deadlineIso: string; labels: string }> }>({
                        type: "object",
                        properties: {
                            goalTitle: { type: "string" },
                            goalDescription: { type: "string" },
                            goalDeadlineIso: { type: "string" },
                            tasks: {
                                type: "array",
                                items: taskItemJsonSchema
                            }
                        },
                        required: ["goalTitle", "goalDescription", "goalDeadlineIso", "tasks"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ goalTitle, goalDescription, goalDeadlineIso, tasks }) => {
                        if (goalId) {
                            return { error: "Уже внутри контекста Цели, нельзя создавать вложенные цели." };
                        }

                        const newGoal = await prisma.goal.create({
                            data: {
                                title: goalTitle,
                                description: goalDescription || null,
                                deadline: goalDeadlineIso ? new Date(goalDeadlineIso).toISOString() : null,
                                userId: user.id
                            }
                        });

                        const tasksToCreate = (tasks as any[]).map((t) => {
                            return {
                                title: t.title,
                                description: t.description || null,
                                deadline: t.deadlineIso ? new Date(t.deadlineIso).toISOString() : null,
                                status: "BACKLOG",
                                labels: t.labels || "ai-generated",
                                userId: user.id,
                                goalId: newGoal.id
                            };
                        });

                        const created = await prisma.task.createMany({ data: tasksToCreate });
                        return {
                            success: true,
                            message: `Цель "${goalTitle}" создана с ${created.count} задачами.`
                        };
                    }
                }),

                delete_task: tool({
                    description: "Удаляет одну или несколько задач по их ID.",
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
                        const deleted = await prisma.task.deleteMany({
                            where: { id: { in: taskIds }, userId: user.id }
                        });
                        return {
                            success: true,
                            message: `Удалено ${deleted.count} задач(и).`
                        };
                    }
                }),

                delete_goal: tool({
                    description: "Удаляет цель по ID. Если deleteTasks=true, также удаляет все задачи этой цели.",
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
                        const existing = await prisma.goal.findFirst({
                            where: { id: targetGoalId, userId: user.id }
                        });
                        if (!existing) {
                            return { error: "Цель не найдена или нет доступа." };
                        }
                        if (shouldDeleteTasks) {
                            await prisma.task.deleteMany({ where: { goalId: targetGoalId, userId: user.id } });
                        }
                        await prisma.goal.delete({ where: { id: targetGoalId } });
                        return {
                            success: true,
                            message: `Цель "${existing.title}" удалена${shouldDeleteTasks ? " вместе со всеми задачами" : ""}.`
                        };
                    }
                }),

                // ========== HABIT TOOLS ==========

                create_habit: tool({
                    description: "Создаёт новую привычку для трекера. Нужно указать имя, эмодзи и цвет.",
                    parameters: jsonSchema<{ name: string; emoji: string; color: string }>({
                        type: "object",
                        properties: {
                            name: { type: "string", description: "Название привычки, например 'Зарядка'" },
                            emoji: { type: "string", description: "Эмодзи для привычки, например '💪'" },
                            color: { type: "string", description: "HEX цвет, например '#6366f1'" }
                        },
                        required: ["name", "emoji", "color"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ name, emoji, color }) => {
                        try {
                            const habit = await (prisma as any).habit.create({
                                data: {
                                    name: name.trim(),
                                    emoji: emoji || "⭐",
                                    color: color || "#6366f1",
                                    userId: user.id,
                                }
                            });
                            return {
                                success: true,
                                habitId: habit.id,
                                message: `Привычка "${emoji} ${name}" создана!`
                            };
                        } catch (err) {
                            return { error: "Не удалось создать привычку. Таблица привычек может быть недоступна." };
                        }
                    }
                }),

                toggle_habit_today: tool({
                    description: "Отмечает привычку как выполненную за сегодня, или снимает отметку если уже отмечена.",
                    parameters: jsonSchema<{ habitId: string; markDone: boolean }>({
                        type: "object",
                        properties: {
                            habitId: { type: "string", description: "ID привычки" },
                            markDone: { type: "boolean", description: "true = отметить выполненной, false = снять отметку" }
                        },
                        required: ["habitId", "markDone"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ habitId, markDone }) => {
                        try {
                            const habit = await (prisma as any).habit.findUnique({ where: { id: habitId } });
                            if (!habit || habit.userId !== user.id) {
                                return { error: "Привычка не найдена." };
                            }

                            const dateStr = new Date().toISOString().split('T')[0];

                            if (markDone) {
                                await (prisma as any).habitLog.upsert({
                                    where: { habitId_date: { habitId, date: dateStr } },
                                    create: { habitId, date: dateStr },
                                    update: {},
                                });
                                return { success: true, message: `Привычка "${habit.emoji} ${habit.name}" отмечена ✅` };
                            } else {
                                await (prisma as any).habitLog.deleteMany({
                                    where: { habitId, date: dateStr },
                                });
                                return { success: true, message: `Отметка с привычки "${habit.emoji} ${habit.name}" снята.` };
                            }
                        } catch (err) {
                            return { error: "Ошибка при обновлении привычки." };
                        }
                    }
                }),

                delete_habit: tool({
                    description: "Удаляет привычку по ID.",
                    parameters: jsonSchema<{ habitId: string }>({
                        type: "object",
                        properties: {
                            habitId: { type: "string", description: "ID привычки для удаления" }
                        },
                        required: ["habitId"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ habitId }) => {
                        try {
                            const habit = await (prisma as any).habit.findUnique({ where: { id: habitId } });
                            if (!habit || habit.userId !== user.id) {
                                return { error: "Привычка не найдена." };
                            }
                            await (prisma as any).habitLog.deleteMany({ where: { habitId } });
                            await (prisma as any).habit.delete({ where: { id: habitId } });
                            return { success: true, message: `Привычка "${habit.emoji} ${habit.name}" удалена.` };
                        } catch (err) {
                            return { error: "Ошибка при удалении привычки." };
                        }
                    }
                }),

                // ========== SUBTASK GENERATION ==========

                generate_subtasks: tool({
                    description: "Генерирует AI-подзадачи (чеклист) для существующей задачи. Используй когда пользователь просит разбить задачу на шаги.",
                    parameters: jsonSchema<{ taskId: string }>({
                        type: "object",
                        properties: {
                            taskId: { type: "string", description: "ID задачи для которой нужно сгенерировать подзадачи" }
                        },
                        required: ["taskId"],
                        additionalProperties: false
                    }),
                    // @ts-ignore
                    execute: async ({ taskId }) => {
                        const task = await prisma.task.findFirst({
                            where: { id: taskId, userId: user.id }
                        });
                        if (!task) {
                            return { error: "Задача не найдена." };
                        }

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
                        let checklist: Array<{ text: string; done: boolean }>;
                        try {
                            const cleaned = raw.replace(/```json|```/g, "").trim();
                            checklist = JSON.parse(cleaned);
                        } catch {
                            checklist = [{ text: "Изучить детали задачи", done: false }];
                        }

                        await (prisma.task as any).update({
                            where: { id: taskId },
                            data: { checklist: JSON.stringify(checklist) }
                        });

                        const subtaskList = checklist.map((s, i) => `${i + 1}. ${s.text}`).join('\n');
                        return {
                            success: true,
                            message: `Подзадачи для "${task.title}" сгенерированы:\n${subtaskList}`
                        };
                    }
                }),
            },
            maxSteps: 5,
        });

        return result.toTextStreamResponse();


    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return new Response("Failed to generate plan", { status: 500 });
    }
}
