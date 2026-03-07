"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Calendar, Settings, LogOut, KanbanSquare, Sun, Moon, Flame, Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    if (pathname === '/login' || pathname === '/register') return null;

    const navigation = [
        { name: "Обзор", href: "/", icon: LayoutDashboard },
        { name: "Цели", href: "/goals", icon: Target },
        { name: "Доска", href: "/board", icon: KanbanSquare },
        { name: "Календарь", href: "/calendar", icon: Calendar },
        { name: "Привычки", href: "/habits", icon: Flame },
    ];

    const sidebarContent = (
        <>
            <div className="flex items-center justify-between px-2 mb-10">
                <div className="flex items-center gap-1.5">
                    <Image
                        src="/nizmix-logo.png"
                        alt="Nizmix Logo"
                        width={44}
                        height={44}
                        className="rounded-xl shrink-0"
                    />
                    <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-zinc-100">Nizmix</span>
                </div>
                {/* Close button — mobile only */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
                </button>
            </div>

            <nav className="flex-1 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isActive
                                ? "bg-gray-100 dark:bg-zinc-800 text-black dark:text-white font-medium"
                                : "text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-white"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-black dark:text-white" : "text-gray-400 dark:text-zinc-500"}`} />
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto space-y-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                {session?.user && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        {session.user.image ? (
                            <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600 dark:text-zinc-400">
                                    {session.user.name?.charAt(0) || "U"}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">{session.user.name}</span>
                            <span className="text-xs text-gray-500 dark:text-zinc-500 truncate">{session.user.email}</span>
                        </div>
                    </div>
                )}

                {mounted && (
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-zinc-400 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-white transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-400 dark:text-zinc-500" /> : <Moon className="w-5 h-5 text-gray-400 dark:text-zinc-500" />}
                        {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                    </button>
                )}

                <Link
                    href="/settings"
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-zinc-400 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-white transition-colors"
                >
                    <Settings className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                    Настройки
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-zinc-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                    Выйти
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <Menu className="w-5 h-5 text-gray-700 dark:text-zinc-300" />
                </button>
                <div className="flex items-center gap-1.5">
                    <Image src="/nizmix-logo.png" alt="Nizmix" width={28} height={28} className="rounded-lg" />
                    <span className="font-bold text-base text-gray-900 dark:text-zinc-100">Nizmix</span>
                </div>
                <div className="w-9" /> {/* Spacer for center alignment */}
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar — slide-in on mobile, always visible on desktop */}
            <div className={`
                fixed md:relative z-50 md:z-auto
                flex flex-col h-screen w-72 md:w-64
                bg-white dark:bg-[#121212]
                border-r border-gray-200 dark:border-zinc-800
                px-4 py-6
                flex-shrink-0 transition-all duration-300 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {sidebarContent}
            </div>

            {/* Bottom Navigation — mobile only */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 px-2 py-1.5 flex items-center justify-around safe-area-bottom">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[52px] ${isActive
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-gray-400 dark:text-zinc-500"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </>
    );
}
