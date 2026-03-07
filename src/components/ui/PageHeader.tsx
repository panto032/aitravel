"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface PageHeaderProps {
  label: string;
  backHref?: string;
}

export function PageHeader({ label, backHref }: PageHeaderProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-between py-6 md:py-8">
      <button
        onClick={() => (backHref ? router.push(backHref) : router.back())}
        className={`w-12 h-12 glass-card rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}
      >
        <ChevronLeft size={20} />
      </button>

      <span
        className={`text-xs font-black uppercase tracking-[0.3em] italic ${
          isDark ? "text-slate-600" : "text-slate-400"
        }`}
      >
        {label}
      </span>

      <button
        onClick={toggleTheme}
        className={`w-12 h-12 glass-card rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer ${
          isDark ? "text-yellow-400" : "text-indigo-600"
        }`}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}
