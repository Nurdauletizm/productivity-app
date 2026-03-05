"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Calendar, Settings, LogOut, KanbanSquare } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (pathname === '/login') return null;

    const navigation = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Goals", href: "/goals", icon: Target },
        { name: "Board", href: "/board", icon: KanbanSquare },
        { name: "Calendar", href: "/calendar", icon: Calendar },
    ];

    return (
        <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200 px-4 py-6 flex-shrink-0">
            <div className="flex items-center gap-2 px-2 mb-10">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="font-semibold text-xl tracking-tight">Notion Like</span>
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
                                ? "bg-gray-100 text-black font-medium"
                                : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-black" : "text-gray-400"}`} />
                            <span className="text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
                {session?.user && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        {session.user.image ? (
                            <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full" />
                        ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                    {session.user.name?.charAt(0) || "U"}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-gray-900 truncate">{session.user.name}</span>
                            <span className="text-xs text-gray-500 truncate">{session.user.email}</span>
                        </div>
                    </div>
                )}
                <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-black transition-colors">
                    <Settings className="w-5 h-5 text-gray-400" />
                    Settings
                </button>
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-5 h-5 text-gray-400" />
                    Log out
                </button>
            </div>
        </div>
    );
}
