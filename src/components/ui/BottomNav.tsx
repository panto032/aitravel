"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, BarChart3, Star, ShieldCheck, Fingerprint } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-auto md:min-w-[450px] h-16 md:h-20 bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[28px] md:rounded-[35px] flex justify-around items-center px-6 z-[200] shadow-2xl shadow-black ring-1 ring-white/5">
      <NavItem
        icon={<Search size={22} />}
        active={isActive("/dashboard") || isActive("/search")}
        href="/dashboard"
      />
      <NavItem
        icon={<BarChart3 size={22} />}
        active={isActive("/compare")}
        href="/compare"
      />

      {/* Center scan button */}
      <button
        onClick={() => router.push("/search")}
        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-[0_8px_30px_rgba(99,102,241,0.4)] -mt-12 md:-mt-16 border border-white/20 cursor-pointer active:scale-90 transition-all hover:shadow-indigo-500/60"
      >
        <Fingerprint size={28} className="text-white" />
      </button>

      <NavItem
        icon={<Star size={22} />}
        active={isActive("/saved")}
        href="/saved"
      />
      <NavItem
        icon={<ShieldCheck size={22} />}
        active={false}
        href="/dashboard"
      />
    </nav>
  );
}

function NavItem({
  icon,
  active,
  href,
}: {
  icon: React.ReactNode;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`p-3 rounded-2xl transition-all duration-300 ${
        active
          ? "text-indigo-400 bg-indigo-500/10"
          : "text-slate-600 hover:text-slate-400 hover:bg-white/5"
      }`}
    >
      {icon}
    </Link>
  );
}
