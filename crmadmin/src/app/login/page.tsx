"use client";

import React, { useState } from "react";

import client from "@/lib/client";
import { toast } from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, Loader2, School as SchoolIcon } from "lucide-react";
import { APP_CONFIG } from "@/constants/config";
import { useRouter } from 'next/navigation';

export default function SchoolLogin() {
    const router = useRouter();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [form, setForm] = useState({
        loginId: "",
        password: "",
    });
    const [schoolInfo, setSchoolInfo] = useState<any>(null);

    React.useEffect(() => {
        client.get('/settings/school-info')
            .then(data => {
                if (data) setSchoolInfo(data);
            })
            .catch(() => {
                // Fallback to /school-info if settings/school-info fails
                client.get('/school-info')
                    .then(data => { if (data) setSchoolInfo(data); })
                    .catch(err => console.error("Failed to load school info:", err));
            });
    }, []);

    const getResolvedUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
            return url;
        }
        const apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
        return `${apiHost}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem(APP_CONFIG.auth.tokens.auth);
            if (token) {
                router.replace('/');
            } else {
                setCheckingAuth(false);
            }
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="animate-spin text-slate-900 mb-4" size={40} />
                <p className="text-xs font-black text-slate-400 uppercase tracking-[4px]">Verifying Session...</p>
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.loginId || !form.password) {
            toast.error("Please enter your credentials");
            return;
        }

        setLoading(true);
        try {
            const data = await client.post("/auth/login", {
                loginId: form.loginId.trim(),
                email: form.loginId.trim(),
                password: form.password,
                clientType: "CRM",
            });

            if (data && data.token) {
                const { tokens } = APP_CONFIG.auth;
                const userObj = data.user || {};
                const userRole = data.role || userObj.role || 'SUPER_ADMIN';

                // Store core auth data
                localStorage.setItem(tokens.auth, data.token);
                localStorage.setItem(tokens.role, String(userRole).toUpperCase());
                localStorage.setItem(tokens.id, String(userObj.id || userObj.userId || ''));
                localStorage.setItem(tokens.data, JSON.stringify(userObj));
                localStorage.setItem(tokens.permissions, JSON.stringify(userObj.permissions || []));

                // Trigger global sync for AbilityProvider
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('crm_auth_update'));
                }

                // Store essential profile data
                localStorage.setItem(`${process.env.NEXT_PUBLIC_STORAGE_PREFIX || 'crm'}_user_name`, userObj.name || userObj.email || 'User');
                localStorage.setItem(`${process.env.NEXT_PUBLIC_STORAGE_PREFIX || 'crm'}_user_email`, userObj.email || '');
                localStorage.setItem(`${process.env.NEXT_PUBLIC_STORAGE_PREFIX || 'crm'}_user_image`, userObj.image || '');

                if (userRole.toUpperCase() === 'TEACHER') {
                    localStorage.setItem(tokens.class, userObj.class || '');
                    localStorage.setItem(`${process.env.NEXT_PUBLIC_STORAGE_PREFIX || 'crm'}_user_section`, userObj.section || '');
                }

                toast.success(`Welcome Back, ${userObj.name || userObj.email || 'User'}!`);
                router.push("/");
            } else {
                toast.error("Login failed: Invalid server response.");
            }
        } catch (err: unknown) {
            console.error("[Login] Authentication Protocol Failure:", err);
            const errorMsg = err instanceof Error
                ? err.message
                : "Unable to connect to the server. Please check network connection.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 lg:p-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600" />

            <div className="w-full max-w-5xl bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden grid md:grid-cols-2 min-h-[640px] border border-slate-100">

                {/* LEFT - Brand Zone */}
                <div className="hidden md:flex flex-col justify-between p-16 bg-slate-900 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-all duration-1000" />

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lgxl flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
                                {schoolInfo?.logoImage ? (
                                    <img
                                        src={getResolvedUrl(schoolInfo.logoImage)}
                                        alt="School Logo"
                                        className="h-full w-full object-contain rounded-full bg-white p-1"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-blue-600 flex items-center justify-center text-white rounded-lgxl shadow-lg shadow-blue-600/20">
                                        <SchoolIcon size={24} strokeWidth={2.5} />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-2xl font-black tracking-tighter uppercase leading-none truncate max-w-[280px]">
                                    {schoolInfo?.schoolName || APP_CONFIG.institution.name}
                                </span>
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[3px] mt-1.5 opacity-80 leading-none">
                                    {schoolInfo?.domainPrefix ? `${schoolInfo.domainPrefix} CRM` : APP_CONFIG.institution.hubName}
                                </span>
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold leading-[1.1] tracking-tight">
                            Institutional <br />
                            <span className="text-blue-500">Governance</span> <br />
                            Terminal.
                        </h1>
                    </div>

                    <div className="relative z-10 space-y-4">
                        <div className="p-6 bg-white/5 rounded-lgxl border border-white/10 backdrop-blur-sm">
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                &quot;Education is the passport to the future, for tomorrow belongs to those who prepare for it today.&quot;
                            </p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[4px]">
                            {APP_CONFIG.system.version} • {APP_CONFIG.system.status}
                        </p>
                    </div>
                </div>

                {/* RIGHT - Auth Interaction Zone */}
                <div className="p-12 lg:p-20 flex flex-col justify-center bg-white relative">
                    <div className="space-y-2 mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Access Verification</h2>
                        <p className="text-slate-400 text-xs font-medium tracking-wide">Enter your institutional credentials to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Email/ID */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Identity Index</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    name="loginId"
                                    type="text"
                                    required
                                    value={form.loginId}
                                    onChange={handleChange}
                                    className="w-full h-14 bg-slate-50 border-none pl-12 pr-4 rounded-lgxl font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
                                    placeholder="admin@school.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Protocol</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                <input
                                    name="password"
                                    type={show ? "text" : "password"}
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    className="w-full h-14 bg-slate-50 border-none pl-12 pr-12 rounded-lgxl font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
                                    placeholder="••••••••••••"
                                />
                                <div
                                    onClick={() => setShow(!show)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-300 hover:text-slate-600 transition-colors"
                                >
                                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                                </div>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Remember Node</span>
                            </label>
                            <span className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors">Forgot Protocol?</span>
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-slate-900 hover:bg-blue-600 text-white rounded-lg font-bold uppercase text-[11px] tracking-[4px] shadow-xl shadow-slate-900/10 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                "LOGIN"
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            Authorized Operational Suite • {schoolInfo?.schoolName || APP_CONFIG.institution.fullName}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}