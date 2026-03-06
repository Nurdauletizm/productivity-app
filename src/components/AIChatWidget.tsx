// @ts-nocheck
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    Sparkles, X, Loader2, Send, Bot, User,
    CheckCircle2, Minus, Maximize2, GripVertical
} from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { mutate } from "swr";
import ReactMarkdown from "react-markdown";

export function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragOffset = useRef({ x: 0, y: 0 });
    const widgetRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
        api: '/api/ai/chat',
        streamProtocol: 'text',
        body: {
            localTimeStr: new Date().toLocaleString('ru-RU', {
                timeZoneName: 'short',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        },
        maxSteps: 3,
        onFinish: () => {
            mutate("/api/tasks");
            mutate("/api/goals");
        }
    });

    // Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current && !isMinimized) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isMinimized]);

    // Drag logic
    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!widgetRef.current) return;
        const rect = widgetRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        setIsDragging(true);
        e.preventDefault();
    }, []);

    useEffect(() => {
        if (!isDragging) return;

        const onMouseMove = (e: MouseEvent) => {
            const newX = e.clientX - dragOffset.current.x;
            const newY = e.clientY - dragOffset.current.y;
            // Clamp to viewport
            const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 380);
            const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 500);
            setPosition({
                x: Math.max(0, Math.min(newX, maxX)),
                y: Math.max(0, Math.min(newY, maxY))
            });
        };

        const onMouseUp = () => {
            setIsDragging(false);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isDragging]);

    // Initial position: bottom-right
    const widgetStyle: React.CSSProperties = position.x !== 0 || position.y !== 0
        ? {
            position: 'fixed',
            left: position.x,
            top: position.y,
            bottom: 'auto',
            right: 'auto',
            zIndex: 9999,
        }
        : {
            position: 'fixed',
            bottom: '5rem',
            right: '2rem',
            zIndex: 9999,
        };

    return (
        <>
            {/* FAB Button (shown when chat is closed) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-full flex flex-col items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all z-[9999] group"
                    title="AI Assistant"
                >
                    <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold mt-0.5 tracking-wider">AI</span>
                </button>
            )}

            {/* Floating Chat Widget */}
            {isOpen && (
                <div
                    ref={widgetRef}
                    style={widgetStyle}
                    className={`bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden transition-all duration-200 ${isDragging ? 'shadow-2xl ring-2 ring-indigo-400/50 select-none' : ''}`}
                >
                    {/* Chat panel width and height */}
                    <div className="flex flex-col" style={{ width: 380, height: isMinimized ? 'auto' : 520 }}>

                        {/* Header — Drag Handle */}
                        <div
                            onMouseDown={onMouseDown}
                            className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 cursor-grab active:cursor-grabbing shrink-0 select-none"
                        >
                            <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-white/60" />
                                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-white">AI Assistant</span>
                                    <p className="text-[10px] text-white/60 leading-none">Знает о ваших задачах</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                                >
                                    {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={() => setIsOpen(false)}
                                    className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Body (hidden when minimized) */}
                        {!isMinimized && (
                            <>
                                {/* Chat History */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/70 dark:bg-[#0f0f0f]">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-8">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 dark:text-zinc-300">AI Ассистент</p>
                                                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 max-w-[220px]">
                                                    Я знаю ваши задачи и цели. Спросите что угодно!
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                                                {[
                                                    "Что у меня на сегодня?",
                                                    "Проанализируй мою доску",
                                                    "Спланируй мою неделю",
                                                    "Добавь задачу",
                                                ].map((prompt) => (
                                                    <button
                                                        key={prompt}
                                                        onClick={() => append({ role: 'user', content: prompt })}
                                                        className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                                    >
                                                        {prompt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        messages.map((m) => (
                                            <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {m.role !== 'user' && (
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                                                        <Bot className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                )}

                                                <div className="flex flex-col gap-1 max-w-[78%]">
                                                    {m.content && (
                                                        <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm'
                                                            : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700/50 rounded-tl-sm shadow-sm'
                                                            }`}>
                                                            {m.role === 'user' ? (
                                                                <>{m.content}</>
                                                            ) : (
                                                                <ReactMarkdown
                                                                    components={{
                                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                                        strong: ({ node, ...props }) => <strong className="font-semibold text-indigo-900 dark:text-indigo-300" {...props} />,
                                                                        ul: ({ node, ...props }) => <ul className="pl-4 space-y-1 mb-2 last:mb-0 list-none ml-0" {...props} />,
                                                                        li: ({ node, ...props }) => <li className="relative pl-0 before:content-[''] before:absolute before:left-[-12px] before:top-[8px] before:w-[4px] before:h-[4px] before:bg-indigo-300 before:rounded-full" {...props} />,
                                                                    }}
                                                                >
                                                                    {m.content}
                                                                </ReactMarkdown>
                                                            )}
                                                        </div>
                                                    )}

                                                    {m.toolInvocations?.map((inv) => (
                                                        inv.state === 'result' ? (
                                                            <div key={inv.toolCallId} className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 rounded-lg text-xs flex items-center gap-1.5 text-green-700 dark:text-green-400">
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                {inv.toolName === 'update_task' ? 'Задача обновлена ✓' : 'Сохранено в базе данных ✓'}
                                                            </div>
                                                        ) : (
                                                            <div key={inv.toolCallId} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-900/30 rounded-lg text-xs flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                {inv.toolName === 'create_goal_with_tasks' ? 'Создаю цель...' : inv.toolName === 'update_task' ? 'Обновляю задачу...' : 'Создаю задачи...'}
                                                            </div>
                                                        )
                                                    ))}
                                                </div>

                                                {m.role === 'user' && (
                                                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                                                        <User className="w-3.5 h-3.5 text-gray-500 dark:text-zinc-400" />
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}

                                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                                        <div className="flex gap-2 justify-start">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                                                <Bot className="w-3.5 h-3.5 text-white" />
                                            </div>
                                            <div className="px-3 py-2.5 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700/50 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="text-center p-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            {error.message}
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-3 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-zinc-800 shrink-0">
                                    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                                        <input
                                            value={input}
                                            onChange={handleInputChange}
                                            placeholder="Напишите сообщение..."
                                            disabled={isLoading}
                                            className="flex-1 bg-gray-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 rounded-xl px-3 py-2.5 text-sm transition-all dark:text-zinc-100 disabled:opacity-50 outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={isLoading || !input.trim()}
                                            className="w-9 h-9 shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
