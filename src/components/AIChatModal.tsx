// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Loader2, Send, Bot, User, CheckCircle2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { mutate } from "swr";

interface AIChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultGoalId?: string;
}

export function AIChatModal({ isOpen, onClose, defaultGoalId }: AIChatModalProps) {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
        api: '/api/ai/chat',
        streamProtocol: 'text',
        body: {
            goalId: defaultGoalId || null
        },
        maxSteps: 3,
        onFinish: () => {
            mutate("/api/tasks");
            mutate("/api/goals");
        }
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-[#121212] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">

                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center animate-pulse">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">AI Assistant</h2>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-[#0a0a0a]/50">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-70">
                            <Sparkles className="w-8 h-8 text-indigo-400" />
                            <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-[250px]">
                                Hello! I'm your AI productivity assistant. Ask me to plan a project, break down a goal, or schedule tasks!
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center mt-4 pt-4">
                                <span className="text-xs px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full cursor-pointer hover:bg-indigo-200" onClick={() => {
                                    append({ role: 'user', content: 'Plan learning Next.js in 2 weeks' });
                                }}>
                                    "Plan learning Next.js"
                                </span>
                                <span className="text-xs px-3 py-1.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full cursor-pointer hover:bg-indigo-200" onClick={() => {
                                    append({ role: 'user', content: 'Schedule meeting with Timur tomorrow at 10am' });
                                }}>
                                    "Schedule meeting"
                                </span>
                            </div>
                        </div>
                    ) : (
                        messages.map((m) => (
                            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {m.role !== 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                )}

                                <div className={`flex flex-col gap-1 max-w-[80%]`}>
                                    {m.content && (
                                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${m.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-sm'
                                            : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 border border-gray-100 dark:border-zinc-700/50 rounded-tl-sm shadow-sm'
                                            }`}>
                                            {m.content}
                                        </div>
                                    )}

                                    {/* Render Tool Invocations */}
                                    {m.toolInvocations?.map((toolInvocation) => {
                                        const { toolName, state } = toolInvocation;
                                        if (state === 'result') {
                                            return (
                                                <div key={toolInvocation.toolCallId} className="px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg text-xs flex items-center gap-2 text-green-700 dark:text-green-400 mt-1">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Database updated successfully!
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={toolInvocation.toolCallId} className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-900/30 rounded-lg text-xs flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mt-1">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    {toolName === 'create_goal_with_tasks' ? 'Setting up macro Goal...' : 'Creating database tasks...'}
                                                </div>
                                            );
                                        }
                                    })}
                                </div>

                                {m.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                                        <User className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="px-4 py-3 bg-white dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700/50 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-zinc-500 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-center p-2 mt-2 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            An error occurred: {error.message}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-zinc-800 shrink-0">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Message AI Assistant..."
                            disabled={isLoading}
                            className="flex-1 bg-gray-100 dark:bg-zinc-900 border-transparent focus:bg-white dark:focus:bg-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm transition-all dark:text-zinc-100 disabled:opacity-50 outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="w-11 h-11 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5 ml-[-2px]" />
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500">
                            AI can make mistakes. Always review the created tasks.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
