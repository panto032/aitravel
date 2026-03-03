"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  BarChart3, Users, Database, Activity, DollarSign,
  Settings, LogOut, Fingerprint, ArrowLeft, Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/lib/theme";

const sidebarNav = [
  { href: "/admin", label: "Pregled", icon: <BarChart3 size={20} /> },
  { href: "/admin/users", label: "Korisnici", icon: <Users size={20} /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading" || !session || session.user.role !== "ADMIN") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#020205]" : "bg-slate-50"}`}>
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 flex overflow-hidden ${isDark ? "bg-[#020205] text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Ambient Lights */}
      <div className={`fixed top-[-10%] left-[-10%] w-[60%] h-[60%] blur-[120px] pointer-events-none rounded-full transition-opacity duration-1000 ${isDark ? "bg-indigo-600/5 opacity-100" : "bg-indigo-500/10 opacity-40"}`} />
      <div className={`fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] pointer-events-none rounded-full transition-opacity duration-1000 ${isDark ? "bg-purple-600/5 opacity-100" : "bg-purple-500/10 opacity-40"}`} />

      {/* Sidebar */}
      <aside className={`w-72 hidden lg:flex flex-col border-r sticky top-0 h-screen z-50 ${isDark ? "bg-[#020205]/60 border-white/5 shadow-2xl" : "bg-white/70 border-black/5"}`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Fingerprint size={24} className="text-white" />
            </div>
            <div className="text-xl font-black italic tracking-tighter uppercase leading-none">
              Travel<span className="text-indigo-500">AI</span>
              <span className={`block text-[8px] font-bold uppercase tracking-[0.3em] not-italic mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Admin Node
              </span>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 font-bold italic text-sm ${
                  pathname === item.href
                    ? "bg-indigo-600/10 border-l-4 border-indigo-600 text-indigo-400 shadow-[inset_10px_0_20px_-10px_rgba(99,102,241,0.2)]"
                    : isDark
                      ? "text-slate-500 hover:bg-white/5 hover:text-white"
                      : "text-slate-400 hover:bg-black/5 hover:text-slate-900"
                }`}
              >
                {item.icon}
                <span className="uppercase tracking-widest text-[11px] font-black leading-none">
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        <div className={`mt-auto p-8 border-t ${isDark ? "border-white/5" : "border-black/5"}`}>
          <Link
            href="/dashboard"
            className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all font-bold italic text-sm ${isDark ? "text-slate-500 hover:bg-white/5 hover:text-white" : "text-slate-400 hover:bg-black/5 hover:text-slate-900"}`}
          >
            <ArrowLeft size={20} />
            <span className="uppercase tracking-widest text-[11px] font-black leading-none">
              Nazad
            </span>
          </Link>

          <div className={`mt-8 p-4 glass-card rounded-2xl ${isDark ? "border-white/5" : "border-black/5"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-emerald-500 italic">
                Central Node Online
              </span>
            </div>
            <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
              System v4.2
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative z-10">
        {/* Header Bar */}
        <header className={`sticky top-0 z-20 backdrop-blur-xl px-6 md:px-12 py-4 flex items-center justify-between border-b ${isDark ? "bg-[#020205]/60 border-white/5" : "bg-white/70 border-black/5"}`}>
          <div className="lg:hidden flex items-center gap-3">
            <div className="text-lg font-black italic tracking-tighter">
              Travel<span className="text-indigo-500">AI</span>
            </div>
            <span className="bg-rose-500/15 text-rose-400 text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">
              Admin
            </span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`w-10 h-10 glass-card rounded-xl flex items-center justify-center transition-all cursor-pointer ${isDark ? "text-yellow-400" : "text-indigo-600"}`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <div className="px-6 md:px-12 py-8 pb-28 md:pb-10">
          {children}
        </div>
      </main>

      {/* Mobile nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <div className={`glass-card rounded-[28px] p-2 flex justify-around ${isDark ? "border-white/10" : "border-black/10"}`}>
          {sidebarNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                pathname === item.href
                  ? "text-indigo-400 bg-indigo-500/10"
                  : isDark ? "text-slate-600" : "text-slate-400"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 py-2 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDark ? "text-slate-600" : "text-slate-400"}`}
          >
            <ArrowLeft size={18} />
            Nazad
          </Link>
        </div>
      </div>
    </div>
  );
}
