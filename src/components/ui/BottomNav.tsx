"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, BarChart3, Star, User, Fingerprint, Sun, Moon, Zap } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] md:w-auto md:min-w-[500px] h-16 md:h-20 backdrop-blur-3xl border rounded-[30px] md:rounded-[40px] flex justify-around items-center px-8 z-[200] shadow-2xl transition-all ${isDark ? 'bg-slate-950/90 border-white/10 shadow-black ring-1 ring-white/5' : 'bg-white/90 border-black/10 shadow-slate-200'}`}>
      <NavItem
        icon={<Search size={22} />}
        active={isActive("/dashboard") || isActive("/search")}
        href="/dashboard"
        isDark={isDark}
      />
      <NavItem
        icon={<BarChart3 size={22} />}
        active={isActive("/compare")}
        href="/compare"
        isDark={isDark}
      />

      {/* Center scan button */}
      <button
        onClick={() => router.push("/search")}
        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_10px_40px_rgba(99,102,241,0.4)] -mt-12 md:-mt-16 border border-white/20 cursor-pointer active:scale-90 transition-all hover:scale-105"
      >
        <Zap size={28} className="text-white fill-white" />
      </button>

      <NavItem
        icon={<Star size={22} />}
        active={isActive("/saved")}
        href="/saved"
        isDark={isDark}
      />

      <button
        onClick={toggleTheme}
        className={`p-2 md:p-3 rounded-xl transition-all ${isDark ? 'bg-white/5 text-slate-400 hover:text-yellow-400' : 'bg-black/5 text-slate-600 hover:text-indigo-600'}`}
        title={isDark ? "Svetla tema" : "Tamna tema"}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <NavItem
        icon={<User size={22} />}
        active={isActive("/profile")}
        href="/profile"
        isDark={isDark}
      />
    </nav>
  );
}

function NavItem({
  icon,
  active,
  href,
  isDark,
}: {
  icon: React.ReactNode;
  active: boolean;
  href: string;
  isDark: boolean;
}) {
  return (
    <Link
      href={href}
      className={`p-3 rounded-2xl transition-all duration-300 ${
        active
          ? "text-indigo-500"
          : isDark
            ? "text-slate-600 hover:text-slate-400"
            : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {icon}
    </Link>
  );
}
