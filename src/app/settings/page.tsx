"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { User, Settings as SettingsIcon, LogOut, Moon, Sun, MonitorSmartphone, Palette, Calendar, AlertTriangle, Lock } from "lucide-react";

type Tab = "profile" | "preferences" | "security";

export default function SettingsPage() {
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>("profile");

    // Profile State
    const [name, setName] = useState(session?.user?.name || "");
    const [email, setEmail] = useState(session?.user?.email || "");

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="border-b border-gray-100 dark:border-zinc-800 pb-5">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">My Profile</h2>
                            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage your personal information and avatar.</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex-shrink-0 relative group cursor-pointer">
                                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 border-4 border-white dark:border-zinc-900 flex items-center justify-center text-blue-600 dark:text-blue-500 text-3xl font-bold shadow-sm overflow-hidden transition-all group-hover:blur-[2px]">
                                    {(name || session?.user?.name || "U").charAt(0).toUpperCase()}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-medium text-gray-900 dark:text-white bg-white/80 dark:bg-black/50 px-2 py-1 rounded backdrop-blur-sm shadow-sm">Change</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-base font-medium text-gray-900 dark:text-zinc-100">Avatar</h3>
                                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">JPEG, PNG or GIF. Max size 2MB.</p>
                                <div className="mt-3 flex gap-3">
                                    <button className="px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors bg-white dark:bg-zinc-900 shadow-sm">
                                        Upload new
                                    </button>
                                    <button className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    value={name || session?.user?.name || ""}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={email || session?.user?.email || ""}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 focus:border-transparent transition-all dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600"
                                />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors border border-transparent dark:border-zinc-700 shadow-sm">
                                Save Changes
                            </button>
                        </div>
                    </div>
                );
            case "preferences":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="border-b border-gray-100 dark:border-zinc-800 pb-5">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Preferences</h2>
                            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Customize your workspace appearance and regional settings.</p>
                        </div>

                        {/* Appearance / Theme */}
                        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                            <div className="flex items-start gap-4 flex-col lg:flex-row">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                    <Palette className="w-5 h-5" />
                                </div>
                                <div className="flex-1 w-full">
                                    <h3 className="text-base font-medium text-gray-900 dark:text-zinc-100">Appearance Theme</h3>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 mb-4">Select how the application looks to you.</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-colors ${theme === 'light' ? 'border-black dark:border-zinc-400 ring-1 ring-black dark:ring-zinc-400 bg-gray-50 dark:bg-zinc-800' : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'}`}
                                        >
                                            <Sun className="w-6 h-6 text-gray-700 dark:text-zinc-400" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-zinc-300">Light</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-colors ${theme === 'dark' ? 'border-black dark:border-zinc-400 ring-1 ring-black dark:ring-zinc-400 bg-gray-50 dark:bg-zinc-800' : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'}`}
                                        >
                                            <Moon className="w-6 h-6 text-gray-700 dark:text-zinc-400" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-zinc-300">Dark</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('system')}
                                            className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-colors ${theme === 'system' ? 'border-black dark:border-zinc-400 ring-1 ring-black dark:ring-zinc-400 bg-gray-50 dark:bg-zinc-800' : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'}`}
                                        >
                                            <MonitorSmartphone className="w-6 h-6 text-gray-700 dark:text-zinc-400" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-zinc-300">System</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calendar */}
                        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                            <div className="flex items-start gap-4 flex-col lg:flex-row">
                                <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    <div className="w-full">
                                        <h3 className="text-base font-medium text-gray-900 dark:text-zinc-100 mb-1">Start of Week</h3>
                                        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">Which day should your calendar start on?</p>
                                        <select className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 transition-all dark:text-zinc-200 cursor-pointer">
                                            <option value="monday">Monday</option>
                                            <option value="sunday">Sunday</option>
                                        </select>
                                    </div>
                                    <div className="w-full">
                                        <h3 className="text-base font-medium text-gray-900 dark:text-zinc-100 mb-1">Time Format</h3>
                                        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-3">How should times be displayed?</p>
                                        <select className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-zinc-600 transition-all dark:text-zinc-200 cursor-pointer">
                                            <option value="24h">24-hour (13:00)</option>
                                            <option value="12h">12-hour (1:00 PM)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                );
            case "security":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="border-b border-gray-100 dark:border-zinc-800 pb-5">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Security & Account</h2>
                            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Manage your connected accounts and data.</p>
                        </div>

                        {/* Connected Accounts */}
                        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-5 shadow-sm mb-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-500 flex items-center justify-center shrink-0">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div className="flex-1 flex justify-between items-center sm:flex-row flex-col sm:items-center items-start gap-3">
                                    <div>
                                        <h3 className="text-base font-medium text-gray-900 dark:text-zinc-100">Google Authentication</h3>
                                        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">You are currently signed in with Google OAuth.</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                        Connected
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 dark:bg-red-900/10 rounded-full -translate-y-16 translate-x-16 blur-xl pointer-events-none"></div>
                            <div className="flex items-start gap-4 relative z-10 flex-col sm:flex-row">
                                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-medium text-red-900 dark:text-red-400">Danger Zone</h3>
                                    <p className="text-sm text-red-700/80 dark:text-red-400/80 mt-1 max-w-lg">
                                        Once you delete your account, there is no going back. All your goals, tasks, and data will be permanently wiped. Please be certain.
                                    </p>
                                    <button className="mt-5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white dark:bg-red-600/90 dark:hover:bg-red-600 rounded-lg text-sm font-medium transition-colors shadow-sm focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950">
                                        Delete My Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fbfbfa] dark:bg-[#0a0a0a] transition-colors">
            <header className="px-8 py-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white/80 dark:bg-[#121212]/80 backdrop-blur-sm sticky top-0 z-10 shrink-0 transition-colors">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 tracking-tight">Settings</h1>
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        Manage your account settings and preferences.
                    </p>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-4 sm:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar Navigation inside Settings */}
                        <nav className="w-full md:w-56 flex flex-col gap-1 shrink-0 bg-white dark:bg-zinc-900/50 p-2 md:p-0 md:bg-transparent md:dark:bg-transparent rounded-xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 dark:border-zinc-800 md:border-transparent md:dark:border-transparent">
                            <button
                                onClick={() => setActiveTab("profile")}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "profile"
                                        ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                                        : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-200"
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                My Profile
                            </button>
                            <button
                                onClick={() => setActiveTab("preferences")}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "preferences"
                                        ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                                        : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-200"
                                    }`}
                            >
                                <SettingsIcon className="w-4 h-4" />
                                Preferences
                            </button>
                            <div className="hidden md:block h-px bg-gray-200 dark:bg-zinc-800 my-2 mx-3"></div>
                            <button
                                onClick={() => setActiveTab("security")}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "security"
                                        ? "bg-black dark:bg-white text-white dark:text-black shadow-sm"
                                        : "text-gray-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400"
                                    }`}
                            >
                                <LogOut className="w-4 h-4" />
                                Security
                            </button>
                        </nav>

                        {/* Tab Content */}
                        <div className="flex-1 bg-white dark:bg-[#121212] rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden p-6 sm:p-8 min-h-[500px] transition-colors">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
