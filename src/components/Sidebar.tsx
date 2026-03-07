"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Calendar, Settings, LogOut, KanbanSquare, Sun, Moon, Flame } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (pathname === '/login') return null;

    const navigation = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Goals", href: "/goals", icon: Target },
        { name: "Board", href: "/board", icon: KanbanSquare },
        { name: "Calendar", href: "/calendar", icon: Calendar },
        { name: "Habits", href: "/habits", icon: Flame },
    ];

    return (
        <div className="flex flex-col h-screen w-64 bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-zinc-800 px-4 py-6 flex-shrink-0 transition-colors">
            <div className="flex items-center gap-1.5 px-2 mb-10">
                <Image
                    src="/nizmix-logo.png"
                    alt="Nizmix Logo"
                    width={44}
                    height={44}
                    className="rounded-xl shrink-0"
                />
                <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-zinc-100">Nizmix</span>
            </div>

            <nav className="flex-1 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
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
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>
                )}

                <Link
                    href="/settings"
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-zinc-400 rounded-md hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-white transition-colors"
                >
                    <Settings className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                    Settings
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-zinc-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    <LogOut className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                    Log out
                </button>
            </div>
        </div>
    );
}
