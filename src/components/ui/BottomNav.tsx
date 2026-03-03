"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Globe, Fingerprint, History, User } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] md:w-auto md:min-w-[500px] h-16 md:h-20 backdrop-blur-3xl border rounded-[30px] md:rounded-[40px] flex justify-around items-center px-8 z-[200] shadow-2xl transition-all ${
        isDark
          ? "bg-slate-950/80 border-white/10 ring-1 ring-white/5"
          : "bg-white/90 border-black/10"
      }`}
    >
      <NavItem
        icon={<Home size={22} />}
        label="Home"
        active={isActive("/dashboard")}
        href="/dashboard"
        isDark={isDark}
      />
      <NavItem
        icon={<Globe size={22} />}
        label="Istrazi"
        active={isActive("/search")}
        href="/search"
        isDark={isDark}
      />

      {/* Center Fingerprint button */}
      <div className="relative">
        <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full pulse-ring" />
        <button
          onClick={() => router.push("/search")}
          className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-[0_15px_40px_rgba(99,102,241,0.5)] -mt-10 md:-mt-14 border border-white/20 cursor-pointer active:scale-90 transition-all hover:scale-110"
        >
          <Fingerprint size={28} className="text-white" />
        </button>
      </div>

      <NavItem
        icon={<History size={22} />}
        label="Arhiva"
        active={isActive("/history")}
        href="/history"
        isDark={isDark}
      />
      <NavItem
        icon={<User size={22} />}
        label="Profil"
        active={isActive("/profile")}
        href="/profile"
        isDark={isDark}
      />
    </nav>
  );
}

function NavItem({
  icon,
  label,
  active,
  href,
  isDark,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  href: string;
  isDark: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${
        active
          ? "text-indigo-500 scale-110"
          : isDark
            ? "text-slate-600 hover:text-slate-400"
            : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {icon}
      <span className="text-[8px] font-black uppercase tracking-tighter leading-none italic">
        {label}
      </span>
    </Link>
  );
}
