"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Target, LayoutDashboard, Users, ArrowLeft } from "lucide-react";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/users", label: "Korisnici", icon: <Users size={18} /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading" || !session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Top bar */}
      <header className="h-16 md:h-20 px-6 md:px-10 flex justify-between items-center z-[100] sticky top-0 bg-[#020205]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="text-xl font-black tracking-tighter italic flex items-center gap-2 text-white">
            <Target size={22} className="text-indigo-500" />
            Travel<span className="text-indigo-500 underline decoration-4 underline-offset-4">AI</span>
          </div>
          <span className="bg-rose-500/15 text-rose-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">
            Admin
          </span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Nazad
        </Link>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className="w-60 min-h-[calc(100vh-80px)] p-5 hidden md:block border-r border-white/5">
          <nav className="space-y-2">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  pathname === item.href
                    ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                    : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
          <div className="glass-card rounded-[28px] p-2 flex justify-around">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  pathname === item.href
                    ? "text-indigo-400 bg-indigo-500/10"
                    : "text-slate-600"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 p-6 md:p-10 pb-28 md:pb-10">{children}</main>
      </div>
    </div>
  );
}
