"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Target } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid email or password");
                return;
            }

            router.push("/");
            router.refresh();
        } catch (error) {
            setError("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fbfbfa] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mb-6">
                    <Target className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                <p className="text-gray-500 text-sm mb-8 text-center">Sign in to manage your productivity goals and tasks securely.</p>

                {error && (
                    <div className="w-full bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-black text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors font-medium mt-6 disabled:opacity-50"
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </button>

                    <div className="text-center pt-4 text-sm text-gray-500">
                        Don't have an account?{" "}
                        <Link href="/register" className="text-black font-medium hover:underline">
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
